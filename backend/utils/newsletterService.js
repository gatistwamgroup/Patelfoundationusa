const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendNewsletterBlast = async (subscribers, subject, content) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("SMTP Credentials not configured");
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const transporter = createTransporter();
    
    // We use blind carbon copy (BCC) to hide individual emails from each other
    // or send them in batches for large lists
    const recipientEmails = subscribers.map(s => s.email);

    const mailOptions = {
        from: `"Patel Foundation Updates" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to self
        bcc: recipientEmails, // Everyone else is BCC
        subject: subject,
        html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eeeeee;">
            <div style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #f9f9f9;">
                <img src="${frontendUrl}/assets/pflogo.png" alt="Patel Foundation" width="180" style="display: block; margin: 0 auto;">
            </div>
            <div style="padding: 40px;">
                <div style="color: #374151; font-size: 16px; line-height: 1.6;">
                    ${content.replace(/\n/g, '<br/>')}
                </div>
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 40px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    You are receiving this email because you subscribed to our newsletter at patelfoundation.org
                </p>
            </div>
        </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendNewsletterBlast };
