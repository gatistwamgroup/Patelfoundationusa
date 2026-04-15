const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    // Backwards-compatible fields (existing code + admin UI rely on these)
    name: {
        type: String,
        required: [true, 'Name is required'],
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
        default: '',
    },

    // Full donor information (new fields)
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zip: { type: String, default: '' },
    comment: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },
    hideAmount: { type: Boolean, default: false },

    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    currency: {
        type: String,
        default: 'USD',
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined while still enforcing uniqueness on set values
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    source: {
        type: String,
        default: 'USA', // Default changed to USA as per requirement
    },
    paymentMethod: {
        type: String,
        default: 'PAYPAL',
    },
    customId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    payerEmail: {
        type: String,
        default: '',
    },
    payerName: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Donation', DonationSchema);
