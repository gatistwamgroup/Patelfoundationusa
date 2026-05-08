const express = require('express');
const router = express.Router();
const {
    initiateRegistration,
    getRegistrations,
    updateRegistration,
    deleteRegistration
} = require('../controllers/eventRegistrationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(initiateRegistration)
    .get(protect, getRegistrations);

router.route('/:id')
    .put(protect, updateRegistration)
    .delete(protect, deleteRegistration);

module.exports = router;
