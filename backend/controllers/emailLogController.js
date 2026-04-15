const EmailLog = require('../models/EmailLog');

exports.getEmailLogs = async (req, res) => {
    try {
        const logs = await EmailLog.find().sort({ sentAt: -1 }).limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Fetch failed", error: error.message });
    }
};
