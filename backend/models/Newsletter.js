const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed'],
        default: 'active'
    },
    source: {
        type: String,
        enum: ['INDIA', 'USA'],
        default: 'USA'
    }
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
