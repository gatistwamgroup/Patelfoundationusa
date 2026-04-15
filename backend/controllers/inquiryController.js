const Inquiry = require('../models/Inquiry');
const { sendInquiryAcknowledgment } = require('../utils/emailService');
const { detectSource } = require('../utils/sourceDetector');

exports.createInquiry = async (req, res) => {
    try {
        const { name, email, type, subject, message } = req.body;
        const source = detectSource(req);
        const inquiry = await Inquiry.create({ name, email, type, subject, message, source });

        // Send Luxury Acknowledgment Email
        try {
            await sendInquiryAcknowledgment(inquiry);
        } catch (mailErr) {
            console.error("[Email] Acknowledgment failed:", mailErr);
        }

        // Generate Real-time Notification
        try {
            const notifType = type === 'contact' ? 'CONTACT' : 'INQUIRY';
            const Notification = require('../models/Notification');
            const newNotif = await Notification.create({
                type: notifType,
                title: type === 'contact' ? 'New Contact Submission' : 'New Volunteer Inquiry',
                message: `${name} sent a ${type} request from ${source}`,
                isRead: false,
                data: { 
                    inquiryId: inquiry._id.toString(), 
                    source,
                    name,
                    email,
                    type,
                    subject
                }
            });

            // Emit via Socket.io
            const io = req.app.get('io');
            if (io) {
                io.emit('notification', newNotif);
            }
        } catch (err) {
            console.error("[Socket.io] Error emitting inquiry notif:", err);
        }

        res.status(201).json({ success: true, data: inquiry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateInquiryStatus = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.status(200).json({ success: true, data: inquiry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteInquiry = async (req, res) => {
    try {
        await Inquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Inquiry deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
