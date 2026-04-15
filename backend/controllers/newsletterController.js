const Newsletter = require('../models/Newsletter');
const { sendNewsletterBlast } = require('../utils/newsletterService');
const { detectSource } = require('../utils/sourceDetector');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const source = detectSource(req);

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({ success: false, message: "Email already subscribed" });
            } else {
                // Re-subscribe
                existing.status = 'active';
                existing.source = source;
                existing.subscribedAt = Date.now();
                await existing.save();
                try {
                    const Notification = require('../models/Notification');
                    const newNotif = await Notification.create({ 
                        type: 'NEWSLETTER', 
                        title: 'Newsletter Resubscription', 
                        message: `${email} has resubscribed from ${source}`, 
                        isRead: false, 
                        data: { email, source } 
                    });
                    const io = req.app.get('io');
                    if (io) io.emit('notification', newNotif);
                } catch (e) { console.error("[Socket.io] Error emitting newsletter notif:", e); }
                return res.status(200).json({ success: true, message: "Re-subscribed successfully" });
            }
        }

        await Newsletter.create({ email, source });
        
        try {
            const Notification = require('../models/Notification');
            const newNotif = await Notification.create({ 
                type: 'NEWSLETTER', 
                title: 'New Newsletter Subscriber', 
                message: `${email} subscribed from ${source}`, 
                isRead: false, 
                data: { email, source } 
            });
            const io = req.app.get('io');
            if (io) io.emit('notification', newNotif);
        } catch (e) { console.error("[Socket.io] Error emitting newsletter notif:", e); }

        res.status(201).json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Subscription failed", error: error.message });
    }
};

exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
        res.status(200).json({ success: true, data: subscribers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Fetch failed", error: error.message });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = await Newsletter.findOne({ email });
        if (subscriber) {
            subscriber.status = 'unsubscribed';
            await subscriber.save();
        }
        res.status(200).json({ success: true, message: "Unsubscribed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Operation failed", error: error.message });
    }
};

exports.sendBlast = async (req, res) => {
    try {
        const { subject, message, isTest = false } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: "Subject and message are required" });
        }

        let subscribers;
        if (isTest) {
            subscribers = [{ email: process.env.EMAIL_USER }];
        } else {
            subscribers = await Newsletter.find({ status: 'active' }).select('email');
        }

        if (subscribers.length === 0) {
            return res.status(400).json({ success: false, message: "No active subscribers found" });
        }

        await sendNewsletterBlast(subscribers, subject, message);

        res.status(200).json({ success: true, message: `Blast sent to ${subscribers.length} recipients successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Blast failed", error: error.message });
    }
};
