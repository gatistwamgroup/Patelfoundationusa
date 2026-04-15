const express = require('express');
const { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createInquiry);
router.get('/', protect, getInquiries);
router.patch('/:id/status', protect, updateInquiryStatus);
router.delete('/:id', protect, deleteInquiry);

module.exports = router;
