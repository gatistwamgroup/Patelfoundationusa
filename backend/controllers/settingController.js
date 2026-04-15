const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.find();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.status(200).json({ success: true, data: settingsMap });
    } catch (error) {
        res.status(500).json({ success: false, message: "Fetch failed", error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // { key: value, ... }
        
        const ops = Object.entries(updates).map(([key, value]) => ({
            updateOne: {
                filter: { key },
                update: { $set: { value } },
                upsert: true
            }
        }));

        await Setting.bulkWrite(ops);

        res.status(200).json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed", error: error.message });
    }
};

exports.getPublicSettings = async (req, res) => {
    try {
        // Only return non-sensitive settings
        const publicKeys = ['foundationName', 'contactEmail', 'contactPhone', 'address', 'footerText', 'donationGoal'];
        const settings = await Setting.find({ key: { $in: publicKeys } });
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.status(200).json({ success: true, data: settingsMap });
    } catch (error) {
        res.status(500).json({ success: false, message: "Fetch failed", error: error.message });
    }
};
