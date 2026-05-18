const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
    to: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, enum: ['receipt', 'admin_alert', 'newsletter_blast', 'acknowledgment', 'donation_receipt', 'admin_notification', 'newsletter', 'event_receipt', 'inquiry', 'contact', 'volunteer', 'admin_event_alert'], required: true },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    error: { type: String },
    source: { type: String, enum: ['INDIA', 'USA'], default: 'USA' },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', EmailLogSchema);
