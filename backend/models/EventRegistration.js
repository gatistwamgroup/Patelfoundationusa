const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
    },
    city: {
        type: String,
        required: [true, 'City/State is required'],
    },
    guests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        default: 1
    },
    ticketType: {
        type: String,
        required: [true, 'Ticket type is required'],
    },
    donationInterest: {
        type: String,
        default: 'No, thank you'
    },
    message: {
        type: String,
        default: ''
    },
    volunteer: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    currency: {
        type: String,
        default: 'USD',
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    customId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);
