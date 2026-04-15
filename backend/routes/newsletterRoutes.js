const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { protect } = require('../middleware/authMiddleware');

// Public Subscription
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Protected Admin View
router.get('/', protect, newsletterController.getAllSubscribers);
router.post('/send-blast', protect, newsletterController.sendBlast);

module.exports = router;
