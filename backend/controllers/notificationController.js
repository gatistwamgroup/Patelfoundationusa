const Notification = require('../models/Notification');

// @desc    Get all notifications (latest first)
// @route   GET /api/notifications
// @access  Private (Admin)
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Admin)
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Mark all notifications as read (optionally by type)
// @route   PUT /api/notifications/read-all
// @access  Private (Admin)
exports.markAllAsRead = async (req, res) => {
    try {
        const { type } = req.body;
        const filter = { isRead: false };
        if (type) {
            filter.type = type;
        }
        await Notification.updateMany(filter, { isRead: true });
        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
