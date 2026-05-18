const { Resend } = require('resend');

const createTransporter = () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    return {
        sendMail: async (options) => {
            const resendOptions = {
                from: options.from,
                to: options.to,
                bcc: options.bcc,
                subject: options.subject,
                html: options.html,
            };
            
            console.log(`\n[Resend-Newsletter] --------------------------------------`);
            console.log(`[Resend-Newsletter] Initiating bulk email send...`);
            console.log(`[Resend-Newsletter] To: ${options.to}`);
            console.log(`[Resend-Newsletter] BCC Count: ${Array.isArray(options.bcc) ? options.bcc.length : 1}`);
            console.log(`[Resend-Newsletter] From: ${resendOptions.from}`);
            console.log(`[Resend-Newsletter] Subject: "${options.subject}"`);

            try {
                const { data, error } = await resend.emails.send(resendOptions);
                if (error) {
                    console.error(`[Resend-Newsletter] Delivery Failed! API Error:`, JSON.stringify(error));
                    throw new Error(error.message || JSON.stringify(error));
                }
                
                console.log(`[Resend-Newsletter] Success! Message ID: ${data?.id}`);
                console.log(`[Resend-Newsletter] --------------------------------------\n`);
                return data;
            } catch (err) {
                console.error(`[Resend-Newsletter] Exception caught during execution:`, err.message || err);
                console.log(`[Resend-Newsletter] --------------------------------------\n`);
                throw err;
            }
        }
    };
};

const sendNewsletterBlast = async (subscribers, subject, content) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY not configured");
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const transporter = createTransporter();
    
    // We use blind carbon copy (BCC) to hide individual emails from each other
    // or send them in batches for large lists
    const recipientEmails = subscribers.map(s => s.email);

    const fromEmail = process.env.EMAIL_FROM || 'donations@patelfoundation.org';
    const mailOptions = {
        from: `Patel Foundation <${fromEmail}>`,
        to: fromEmail, // Send to self
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
