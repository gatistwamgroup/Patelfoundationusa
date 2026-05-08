const express = require('express');
const router = express.Router();
const { initiateDonation, captureOrder, handleWebhook, warmToken, initiateEventPayment, captureEventOrder } = require('../controllers/paypalController');

// @route GET  /api/paypal/warm  — pre-cache OAuth token on page load
router.get('/warm', warmToken);

// @route POST /api/paypal/initiate
router.post('/initiate', initiateDonation);

// @route POST /api/paypal/capture-order
router.post('/capture-order', captureOrder);

// @route POST /api/paypal/webhook
router.post('/webhook', handleWebhook);

// Event Payment Routes
router.post('/initiate-event', initiateEventPayment);
router.post('/capture-event', captureEventOrder);

module.exports = router;
