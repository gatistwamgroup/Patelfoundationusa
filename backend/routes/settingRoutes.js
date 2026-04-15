const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');

// Public route for frontend
router.get('/public', settingController.getPublicSettings);

// Admin protected routes
router.get('/', protect, settingController.getSettings);
router.post('/update', protect, settingController.updateSettings);

module.exports = router;
