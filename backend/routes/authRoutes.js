const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/authController');

// @route POST /api/auth/login
router.post('/login', adminLogin);

module.exports = router;
