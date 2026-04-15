"use strict";
require("dotenv").config();

const axios = require("axios");
const https = require("https");
const Donation = require("../models/Donation");
const { sendDonationReceipt, sendAdminNotification } = require("../utils/emailService");
const { detectSource } = require("../utils/sourceDetector");

// ─── Shared HTTPS agent (IPv4 + keepAlive) ─────────────────────────────────
const httpsAgent = new https.Agent({ family: 4, keepAlive: true, rejectUnauthorized: false });

// ─── Shared Axios headers for every PayPal call ────────────────────────────
const baseHeaders = {
    "User-Agent": "PostmanRuntime/7.32.3",
    "Accept": "*/*",
    "Connection": "keep-alive",
};

// ─── In-memory access-token cache (~9 hours TTL) ───────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

// ─── Helper: Generate (or return cached) PayPal OAuth token ────────────────
const generateAccessToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
        return cachedToken;
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
        throw new Error("Missing PayPal credentials in environment");
    }

    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    console.log("[PayPal] Fetching new access token...");

    const tokenResponse = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
        method: "POST",
        data: "grant_type=client_credentials",
        headers: {
            ...baseHeaders,
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent,
        timeout: 10_000,
    });

    console.log("[PayPal] ACCESS TOKEN response:", {
        scope: tokenResponse.data.scope?.slice(0, 60),
        expires_in: tokenResponse.data.expires_in,
        token_type: tokenResponse.data.token_type,
    });

    cachedToken = tokenResponse.data.access_token;
    tokenExpiresAt = Date.now() + tokenResponse.data.expires_in * 1000;

    return cachedToken;
};

// ─── Controller: Initiate Donation (Pre-PayPal) ─────────────────────────────
/**
 * @desc  Collects donor info, creates PENDING record, then creates PayPal order
 * @route POST /api/paypal/initiate-donation
 * @access Public
 */
const initiateDonation = async (req, res) => {
    try {
        const {
            // New "full donor" fields
            firstName,
            lastName,
            address,
            city,
            state: donorState,
            country,
            zip,
            comment,
            isAnonymous,
            hideAmount,

            // Legacy fields (still accepted to avoid breaking old clients)
            name: legacyName,
            email,
            phone,
            amount,

            // Support for bank transfer
            paymentMethod,
        } = req.body || {};

        const toBool = (v) => v === true || v === "true" || v === "1";

        const parsedAmount = parseFloat(amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, message: "Valid positive amount is required" });
        }

        // If any of the new donor fields are present, require the full donor set.
        // Derive name from first/last if provided, else fallback to legacy name.
        const normalizedFirst = (firstName ?? "").toString().trim();
        const normalizedLast = (lastName ?? "").toString().trim();
        const derivedName =
            normalizedFirst && normalizedLast
                ? `${normalizedFirst} ${normalizedLast}`
                : (legacyName ?? "").toString().trim();

        // If we only have a legacy name, split it into first/last best-effort.
        const nameParts = derivedName ? derivedName.split(/\s+/).filter(Boolean) : [];
        const derivedFirstName = normalizedFirst || nameParts[0] || "";
        const derivedLastName = normalizedLast || nameParts.slice(1).join(" ") || nameParts[0] || "";

        const normalizedEmail = (email ?? "").toString().trim();
        const normalizedPhone = (phone ?? "").toString().trim();

        const normalizedAddress = (address ?? "").toString().trim();
        const normalizedCity = (city ?? "").toString().trim();
        const normalizedState = (donorState ?? "").toString().trim();
        const normalizedCountry = (country ?? "").toString().trim();
        const normalizedZip = (zip ?? "").toString().trim();
        const normalizedComment = (comment ?? "").toString().trim();

        const normalizedIsAnonymous = toBool(isAnonymous);
        const normalizedHideAmount = toBool(hideAmount);

        const errors = [];

        // Always require core identity + email.
        if (!derivedName) errors.push("Donor name is required");
        if (!normalizedEmail) errors.push("Donor email is required");

        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: "Invalid donation details", errors });
        }

        // Basic email shape validation
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Please add a valid email" });
        }

        // ZIP should be digits only (US-style ZIP+4 accepted) if provided
        const zipRegex = /^[0-9]{4,10}$/;
        if (normalizedZip && !zipRegex.test(normalizedZip)) {
            return res.status(400).json({ success: false, message: "Please add a valid ZIP code" });
        }

        // Phone is optional, but if provided it should look plausible
        if (normalizedPhone && !/^[0-9+\-() ]{7,}$/.test(normalizedPhone)) {
            return res.status(400).json({ success: false, message: "Please add a valid phone number" });
        }

        // 2. Create unique internal ID for tracking
        const customId = `PF_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        // Detect Source (USA or INDIA)
        const source = detectSource(req);

        // --- SUPPORT BANK TRANSFER (Early Return) ---
        if (paymentMethod === "BANK_TRANSFER") {
            const btCustomId = `BT_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            await Donation.create({
                name: derivedName,
                email: normalizedEmail,
                phone: normalizedPhone || "",
                firstName: derivedFirstName,
                lastName: derivedLastName,
                address: normalizedAddress,
                city: normalizedCity,
                state: normalizedState,
                country: normalizedCountry,
                zip: normalizedZip,
                comment: normalizedComment,
                isAnonymous: normalizedIsAnonymous,
                hideAmount: normalizedHideAmount,
                amount: parsedAmount,
                currency: "INR",
                status: "pending",
                customId: btCustomId,
                source: source,
                paymentMethod: "BANK_TRANSFER"
            });

            return res.status(200).json({
                success: true,
                message: "Bank transfer submitted",
                customId: btCustomId
            });
        }
        // --------------------------------------------

        // 3. Create Pending Record in DB
        const pendingDonation = await Donation.create({
            // Legacy-compatible fields
            name: derivedName,
            email: normalizedEmail,
            phone: normalizedPhone || "",

            // New full donor fields
            firstName: derivedFirstName,
            lastName: derivedLastName,
            address: normalizedAddress,
            city: normalizedCity,
            state: normalizedState,
            country: normalizedCountry,
            zip: normalizedZip,
            comment: normalizedComment,
            isAnonymous: normalizedIsAnonymous,
            hideAmount: normalizedHideAmount,

            amount: parsedAmount,
            status: "pending",
            customId,
            source: source,
            paymentMethod: paymentMethod || "PAYPAL"
        });

        console.log(`[DB] Created Pending Donation: ${customId}`);

        // 4. Create PayPal Order
        const origin = req.headers.origin || req.headers.referer || process.env.FRONTEND_URL || "http://localhost:8080";
        // Clean origin (remove trailing slash)
        const baseUrl = origin.replace(/\/$/, "");
        
        // Use different success/cancel paths for India website if needed
        const successPath = (source === "INDIA") ? "/donation-success" : "/success";
        const cancelPath = (source === "INDIA") ? "/donation-cancel" : "/cancel";

        const accessToken = await generateAccessToken();

        const orderPayload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: customId,
                    custom_id: customId, // This is key for tracking back
                    amount: {
                        currency_code: "USD",
                        value: parsedAmount.toFixed(2),
                    },
                    description: "Donation to Patel Foundation",
                },
            ],
            application_context: {
                brand_name: "Patel Foundation",
                landing_page: "LOGIN",
                user_action: "PAY_NOW",
                return_url: `${baseUrl}${successPath}`,
                cancel_url: `${baseUrl}${cancelPath}`,
            }
        };

        const orderResponse = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
            method: "POST",
            headers: {
                ...baseHeaders,
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            data: orderPayload,
            httpsAgent,
            timeout: 15_000,
        });

        const approveLink = orderResponse.data.links.find(l => l.rel === 'approve');

        console.log(`[PayPal] Order ${orderResponse.data.id} created for ${customId}`);

        return res.status(201).json({
            id: orderResponse.data.id,
            approvalUrl: approveLink?.href
        });

    } catch (error) {
        const errData = error.response?.data || error.message;
        console.error("[PayPal] Error initiating donation detail:", JSON.stringify(errData, null, 2));
        console.error("[PayPal] Error stack:", error.stack);
        return res.status(500).json({ success: false, message: "Failed to initiate donation process", error: errData });
    }
};

// ─── Controller: Capture Order ─────────────────────────────────────────────
/**
 * @desc  Captures the payment and updates the pending record to COMPLETED
 * @route POST /api/paypal/capture-order
 * @access Public
 */
const captureOrder = async (req, res) => {
    try {
        const { orderID } = req.body;

        if (!orderID) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        const accessToken = await generateAccessToken();

        console.log(`[PayPal] Capturing order: ${orderID}`);

        let data;
        try {
            const captureResponse = await axios({
                url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
                method: "POST",
                headers: {
                    ...baseHeaders,
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                httpsAgent,
                timeout: 15_000,
            });
            data = captureResponse.data;
        } catch (captureErr) {
            const errData = captureErr.response?.data;
            const isAlreadyCaptured =
                errData?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED" ||
                errData?.name === "UNPROCESSABLE_ENTITY" ||
                captureErr.response?.status === 422;

            if (isAlreadyCaptured) {
                console.log(`[PayPal] Order ${orderID} was already captured. Fetching details instead...`);
                // If it's already captured, we just fetch the order details to get the capture ID and status
                const getOrderResponse = await axios({
                    url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}`,
                    method: "GET",
                    headers: {
                        ...baseHeaders,
                        Authorization: `Bearer ${accessToken}`,
                    },
                    httpsAgent,
                    timeout: 15_000,
                });
                data = getOrderResponse.data;
            } else {
                throw captureErr;
            }
        }

        console.log("[PayPal] Order state after capture/fetch:", data.status);

        if (data.status === "COMPLETED") {
            const purchaseUnit = data.purchase_units[0];
            // The capture might be under payments.captures if we just captured it, 
            // but if we fetched the order, it's also under purchase_units[0].payments.captures
            const capture = purchaseUnit?.payments?.captures?.[0];
            const payer = data.payer;

            const customId =
                capture?.custom_id ||
                capture?.custom?.id ||
                purchaseUnit.custom_id ||
                "";

            if (!capture?.id || !customId) {
                console.error("[PayPal] Missing capture.id or customId:", {
                    hasCapture: Boolean(capture),
                    customId,
                });
                return res.status(400).json({ success: false, message: "Invalid PayPal capture payload" });
            }

            const payerName = payer?.name?.given_name
                ? `${payer.name.given_name} ${payer.name.surname || ""}`.trim()
                : (payer?.name?.full_name || "");

            console.log(`[PayPal] Linking capture ${capture.id} to customId ${customId}`);

            // First check if it's already marked as completed in DB to avoid duplicate emails
            const existingDonation = await Donation.findOne({ customId: customId });

            if (existingDonation && existingDonation.status === "completed") {
                console.log(`[DB] Donation ${customId} is already marked COMPLETED in database.`);
                // Return success without duplicating emails
                return res.status(200).json(data);
            }

            // Find and update the original pending record
            const updatedDonation = await Donation.findOneAndUpdate(
                { customId: customId },
                {
                    status: "completed",
                    transactionId: capture.id,
                    payerEmail: payer.email_address,
                    payerName: payerName,
                    // If PayPal user modified the amount (unlikely with fixed value), update it
                    amount: parseFloat(capture.amount.value)
                },
                { returnDocument: 'after' }
            );

            let finalDonation = null;

            if (updatedDonation) {
                console.log(`[DB] Success! Donation ${customId} marked COMPLETED`);
                finalDonation = updatedDonation;
            } else {
                // Fallback: Create from scratch if customId not found (unlikely)
                console.warn(`[DB] CustomId ${customId} not found. Creating new record.`);
                const fallbackOrigin = req.headers.origin || "";
                let fallbackSource = "USA";
                if (fallbackOrigin.toLowerCase().includes("india")) {
                    fallbackSource = "INDIA";
                }

                const fallbackFullName = payerName || payer?.name?.full_name || `${payer?.name?.given_name || ""} ${payer?.name?.surname || ""}`.trim() || "PayPal Donor";
                finalDonation = await Donation.create({
                    name: fallbackFullName,
                    email: payer.email_address,
                    payerName: payerName,
                    amount: parseFloat(capture.amount.value),
                    transactionId: capture.id,
                    status: "completed",
                    source: fallbackSource,
                    customId: customId
                });
            }

            if (finalDonation) {
                // Dispatch notifications (Emails)
                sendDonationReceipt(finalDonation).catch(console.error);
                sendAdminNotification(finalDonation).catch(console.error);
                
                // Create Realtime Notification in DB
                try {
                    const Notification = require('../models/Notification');
                    const symbol = finalDonation.currency === 'INR' ? '₹' : '$';
                    const newNotif = await Notification.create({
                        type: 'DONATION',
                        title: "New Donation",
                        message: `${symbol}${finalDonation.amount.toLocaleString()} donation from ${finalDonation.source} (${finalDonation.status.charAt(0).toUpperCase() + finalDonation.status.slice(1)})`,
                        isRead: false,
                        data: {
                            donationId: finalDonation._id.toString(),
                            amount: finalDonation.amount,
                            currency: finalDonation.currency,
                            source: finalDonation.source,
                            paymentMethod: finalDonation.paymentMethod,
                            status: finalDonation.status
                        }
                    });

                    // Emit via Socket.io
                    const io = req.app.get('io');
                    if (io) {
                        io.emit('notification', newNotif);
                    }
                } catch (err) {
                    console.error("[Socket.io] Error creating/emitting notification:", err);
                }
            }
        }

        return res.status(200).json(data);
    } catch (error) {
        const errData = error.response?.data || error.message;
        console.error("[PayPal] Capture Error:", errData);
        return res.status(500).json({ success: false, message: "Failed to capture PayPal order", error: errData });
    }
};

// ─── Helper: Verify Webhook Signature ─────────────────────────────────────
const verifyWebhookSignature = async (req) => {
    try {
        const accessToken = await generateAccessToken();
        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
            method: "POST",
            headers: {
                ...baseHeaders,
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            data: {
                auth_algo: req.headers["paypal-auth-algo"],
                cert_url: req.headers["paypal-cert-url"],
                transmission_id: req.headers["paypal-transmission-id"],
                transmission_sig: req.headers["paypal-transmission-sig"],
                transmission_time: req.headers["paypal-transmission-time"],
                webhook_id: process.env.PAYPAL_WEBHOOK_ID,
                webhook_event: req.body,
            },
            httpsAgent,
            timeout: 10_000,
        });
        return response.data.verification_status === "SUCCESS";
    } catch (error) {
        console.error("[PayPal] Webhook verification error:", error.response?.data || error.message);
        return false;
    }
};

// ─── Controller: Handle Webhooks ───────────────────────────────────────────
/**
 * @route  POST /api/paypal/webhook
 * @access Public (signature-verified)
 */
const handleWebhook = async (req, res) => {
    try {
        const isVerified = await verifyWebhookSignature(req);
        if (!isVerified) {
            console.warn("[PayPal] Webhook signature verification FAILED");
            return res.status(401).send("Invalid Signature");
        }

        const { event_type: eventType, resource } = req.body;
        console.log(`[PayPal] Webhook received: ${eventType}`);

        if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
            const query = resource.custom_id ? { customId: resource.custom_id } : { transactionId: resource.id };
            await Donation.findOneAndUpdate(
                query,
                {
                    status: "completed",
                    transactionId: resource.id,
                    payerEmail: resource.payer?.email_address,
                    payerName: resource.payer?.name?.given_name
                        ? `${resource.payer.name.given_name} ${resource.payer.name.surname || ""}`.trim()
                        : (resource.payer?.name?.full_name || "")
                },
                { new: true }
            );
            console.log(`[DB] Transaction ${resource.id} marked COMPLETED via webhook linking ${resource.custom_id || 'direct id'}`);
        } else if (eventType === "PAYMENT.CAPTURE.DENIED") {
            const query = resource.custom_id ? { customId: resource.custom_id } : { transactionId: resource.id };
            await Donation.findOneAndUpdate(
                query,
                { status: "failed" }
            );
            console.log(`[DB] Transaction ${resource.id} marked FAILED via webhook`);
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error("[PayPal] Webhook handler error:", error.message);
        return res.status(500).send("Internal Server Error");
    }
};

// ─── Controller: Warm OAuth Token ────────────────────────────────────────────
/**
 * @desc  Pre-fetches and caches PayPal OAuth token
 * @route GET /api/paypal/warm
 * @access Public
 */
const warmToken = async (_req, res) => {
    try {
        await generateAccessToken();
        return res.status(200).json({ success: true, message: "PayPal token cache warmed" });
    } catch (error) {
        const errData = error.response?.data || error.message;
        console.error("[PayPal] Warm token error:", errData);
        return res.status(500).json({ success: false, message: "Failed to warm PayPal token", error: errData });
    }
};

module.exports = { initiateDonation, captureOrder, handleWebhook, warmToken };
