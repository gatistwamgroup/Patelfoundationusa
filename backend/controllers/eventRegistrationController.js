const EventRegistration = require('../models/EventRegistration');
const { sendAdminNotification } = require('../utils/emailService');
const Notification = require('../models/Notification');

/**
 * @desc  Initiate event registration (create pending record)
 * @route POST /api/event-registration
 * @access Public
 */
const initiateRegistration = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            city,
            guests,
            ticketType,
            donationInterest,
            message,
            volunteer
        } = req.body;

        // Simple validation
        if (!fullName || !email || !phone || !city) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        // Calculate amount based on ticket type
        // Standard Seat ($150) or VIP Table ($1200)
        let amount = 150;
        if (ticketType && ticketType.includes('VIP')) {
            amount = 1200;
        }
        
        // Multiply by guests if it's per seat (though VIP is usually per table)
        const numGuests = parseInt(guests) || 1;
        if (!ticketType.includes('VIP')) {
            amount = amount * numGuests;
        }

        const customId = `EVT_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const registration = await EventRegistration.create({
            fullName,
            email,
            phone,
            city,
            guests: numGuests,
            ticketType,
            donationInterest,
            message,
            volunteer,
            amount,
            customId,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: registration,
            message: "Registration initiated successfully"
        });
        
        // Create Realtime Notification for Admin
        try {
            const newNotif = await Notification.create({
                type: 'REGISTRATION',
                title: "New Event Registration",
                message: `${registration.fullName} registered for ${registration.ticketType} ($${registration.amount})`,
                isRead: false,
                data: {
                    registrationId: registration._id.toString(),
                    amount: registration.amount,
                    ticketType: registration.ticketType,
                    guests: registration.guests
                }
            });

            const io = req.app.get('io');
            if (io) {
                io.emit('notification', newNotif);
            }
        } catch (err) {
            console.error("[Socket.io] Notification error:", err);
        }

    } catch (error) {
        console.error("[EventRegistration] Error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

/**
 * @desc Get all registrations for admin
 * @route GET /api/event-registration
 * @access Private/Admin
 */
const getRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: registrations.length, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch registrations", error: error.message });
    }
};

/**
 * @desc Update registration status (Manual or via Webhook)
 * @route PUT /api/event-registration/:id
 * @access Private/Admin
 */
const updateRegistration = async (req, res) => {
    try {
        const registration = await EventRegistration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }
        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed", error: error.message });
    }
};

/**
 * @desc Delete registration
 * @route DELETE /api/event-registration/:id
 * @access Private/Admin
 */
const deleteRegistration = async (req, res) => {
    try {
        const registration = await EventRegistration.findByIdAndDelete(req.params.id);
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }
        res.status(200).json({ success: true, message: "Registration deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Deletion failed", error: error.message });
    }
};

module.exports = {
    initiateRegistration,
    getRegistrations,
    updateRegistration,
    deleteRegistration
};
