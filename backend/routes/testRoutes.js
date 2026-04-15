const express = require('express');
const router = express.Router();
const { getTestMessage } = require('../controllers/testController');

// @route GET /api/test
router.route('/test').get(getTestMessage);

module.exports = router;
