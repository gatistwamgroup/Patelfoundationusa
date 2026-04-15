const express = require('express');
const router = express.Router();
const emailLogController = require('../controllers/emailLogController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, emailLogController.getEmailLogs);

module.exports = router;
