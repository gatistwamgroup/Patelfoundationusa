const Donation = require('../models/Donation');
const EventRegistration = require('../models/EventRegistration');

/**
 * @desc Get all donations
 * @route GET /api/donations
 */
const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });
        const totalAmount = donations.reduce((sum, item) => sum + item.amount, 0);
        res.status(200).json({ success: true, count: donations.length, totalAmount, data: donations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch donations", error: error.message });
    }
};

/**
 * @desc Get aggregated donation statistics for the admin dashboard
 * @route GET /api/donations/stats
 */
const getDonationStats = async (req, res) => {
    try {
        const [donations, registrations] = await Promise.all([
            Donation.find().sort({ createdAt: -1 }),
            EventRegistration.find().sort({ createdAt: -1 })
        ]);

        const completed = donations.filter(d => d.status === 'completed');
        const totalAmount = completed.reduce((sum, d) => sum + d.amount, 0);
        const avgDonation = completed.length > 0 ? totalAmount / completed.length : 0;

        // Top 5 donors by amount
        const topDonors = [...completed]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Last 6 months revenue trend
        const now = new Date();
        const trend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthDonations = completed.filter(don => {
                const da = new Date(don.createdAt);
                return da.getFullYear() === d.getFullYear() && da.getMonth() === d.getMonth();
            });
            trend.push({
                month: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                revenue: monthDonations.reduce((sum, d) => sum + d.amount, 0),
                count: monthDonations.length,
            });
        }

        // Status breakdown
        const statusBreakdown = {
            completed: donations.filter(d => d.status === 'completed').length,
            pending: donations.filter(d => d.status === 'pending').length,
            failed: donations.filter(d => d.status === 'failed').length,
        };

        // Source breakdown
        const sourceMap = {};
        donations.forEach(d => { sourceMap[d.source] = (sourceMap[d.source] || 0) + 1; });

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalAmount,
                totalDonors: completed.length,
                avgDonation,
                totalTransactions: donations.length,
                topDonors,
                trend,
                statusBreakdown,
                sourceBreakdown: sourceMap,
                // Add registration stats
                totalRegistrations: registrations.length,
                completedRegistrations: registrations.filter(r => r.status === 'completed').length,
                pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch stats", error: error.message });
    }
};

/**
 * @desc Create a manual donation (Offline)
 * @route POST /api/donations
 * @access Private/Admin
 */
const createDonation = async (req, res) => {
    try {
        const { name, email, amount, source, paymentMethod, date, comment, status } = req.body;

        if (!name || !email || !amount) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        const donation = await Donation.create({
            name,
            email,
            amount: parseFloat(amount),
            source: source || 'USA',
            paymentMethod: paymentMethod || 'PAYPAL',
            status: status || 'completed',
            createdAt: date || Date.now(),
            comment,
            customId: `MAN_${Date.now()}`
        });

        res.status(201).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Creation failed", error: error.message });
    }
};

/**
 * @desc Update a donation
 * @route PUT /api/donations/:id
 * @access Private/Admin
 */
const updateDonation = async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }
        res.status(200).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed", error: error.message });
    }
};

/**
 * @desc Delete a donation
 * @route DELETE /api/donations/:id
 * @access Private/Admin
 */
const deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(req.params.id);
        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }
        res.status(200).json({ success: true, message: "Donation deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Deletion failed", error: error.message });
    }
};

module.exports = { getDonations, getDonationStats, createDonation, updateDonation, deleteDonation };

