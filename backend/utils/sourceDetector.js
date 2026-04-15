"use strict";

/**
 * Detects the origin source (INDIA or USA) of a request
 * @param {Object} req - Express request object
 * @returns {String} "INDIA" or "USA"
 */
const detectSource = (req) => {
    // 0. Manual override from body (highest priority)
    if (req.body && req.body.source) {
        if (req.body.source.toUpperCase() === "INDIA") return "INDIA";
        if (req.body.source.toUpperCase() === "USA") return "USA";
    }

    const origin = req.headers.origin || req.headers.referer || "";
    
    // 1. Check origin/referer first
    if (origin.toLowerCase().includes("india")) {
        return "INDIA";
    }

    // 2. Secondary check: body country or payment method
    if (req.body) {
        if (req.body.country === "India" || req.body.country === "INDIA") {
            return "INDIA";
        }
        if (req.body.paymentMethod === "BANK_TRANSFER") {
            return "INDIA";
        }
    }

    // Default to USA
    return "USA";
};

module.exports = { detectSource };
