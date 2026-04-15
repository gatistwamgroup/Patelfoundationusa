const express = require('express');
const router = express.Router();
const { getDonations, getDonationStats, createDonation, updateDonation, deleteDonation } = require('../controllers/donationController');
const { initiateDonation } = require('../controllers/paypalController');
const { protect } = require('../middleware/authMiddleware');

// Public route to start donation
router.post('/initiate', initiateDonation);

// Secured admin routes
router.get('/', protect, getDonations);
router.post('/', protect, createDonation);
router.get('/stats', protect, getDonationStats);
router.put('/:id', protect, updateDonation);
router.delete('/:id', protect, deleteDonation);

module.exports = router;
