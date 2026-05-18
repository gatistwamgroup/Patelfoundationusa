const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');
const EmailLog = require('../models/EmailLog');

const LOGO_ATTACHMENT = {
  filename: 'pflogo.png',
  path: path.join(__dirname, '../../frontend/public/assets/pflogo.png'),
  cid: 'logo',
  contentDisposition: 'inline'
};

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

      if (options.attachments && options.attachments.length > 0) {
        resendOptions.attachments = options.attachments.map(att => {
          let content = att.content;
          if (!content && att.path) {
            content = fs.readFileSync(att.path);
          }
          return {
            filename: att.filename,
            content: content
          };
        });
      }

      console.log(`\n[Resend] ---------------------------------------------`);
      console.log(`[Resend] Initiating email send...`);
      console.log(`[Resend] To: ${options.to || options.bcc}`);
      console.log(`[Resend] From: ${resendOptions.from}`);
      console.log(`[Resend] Subject: "${options.subject}"`);
      
      try {
        const { data, error } = await resend.emails.send(resendOptions);
        
        if (error) {
          console.error(`[Resend] Delivery Failed! API Error:`, JSON.stringify(error));
          throw new Error(error.message || JSON.stringify(error));
        }
        
        console.log(`[Resend] Success! Message ID: ${data?.id}`);
        console.log(`[Resend] ---------------------------------------------\n`);
        return data;
      } catch (err) {
        console.error(`[Resend] Exception caught during execution:`, err.message || err);
        console.log(`[Resend] ---------------------------------------------\n`);
        throw err;
      }
    }
  };
};

const logEmail = async (to, subject, type, status, error = null, source = "USA") => {
  try {
    await EmailLog.create({ to, subject, type, status, error, source });
  } catch (e) {
    console.error('Logging failed:', e);
  }
};

// ─── Donor Receipt Email (Ultra-Premium Light Theme) ────────────────────────
const sendDonationReceipt = async (donor) => {
  console.log(`[Email Trace] sendDonationReceipt called for donor: ${donor.email}`);
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email Trace] RESEND_API_KEY not configured. Skipping sendDonationReceipt.');
    return;
  }

  const donorName = donor.name || 'Valued Donor';
  const amount = donor.amount ? donor.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
  const currency = donor.currency || 'USD';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const transactionId = donor.transactionId || donor.customId || 'N/A';
  const frontendUrl = process.env.FRONTEND_URL || 'https://mypatelfoundation.org';

  const transporter = createTransporter();
  const mailOptions = {
    from: `Patel Foundation <${process.env.EMAIL_FROM || 'donations@patelfoundation.org'}>`,
    to: donor.email,
    subject: `Your Donation Receipt — Thank You, ${donorName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; background-color: #faf9f6; -webkit-font-smoothing: antialiased; }
    .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { text-align: center; padding: 60px 40px 40px; background-color: #ffffff; }
    .logo-container { margin-bottom: 24px; pointer-events: none; }
    img { pointer-events: none; -webkit-user-drag: none; }
    .logo-icon { font-size: 36px; line-height: 1; }
    .brand-name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; color: #1a1a1a; margin: 0; letter-spacing: -0.5px; }
    .brand-accent { width: 40px; height: 1px; background-color: #d4af37; margin: 16px auto; }
    .receipt-title { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; color: #808080; text-transform: uppercase; letter-spacing: 3px; margin: 0; }
    .content-area { padding: 0 50px 50px; }
    .greeting { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; color: #1a1a1a; margin: 0 0 20px 0; }
    .message { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 300; color: #4a4a4a; line-height: 1.8; margin: 0 0 40px 0; }
    .details-card { background-color: #faf9f6; padding: 32px; margin-bottom: 40px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
    .details-row { display: table; width: 100%; margin-bottom: 16px; font-family: 'Inter', sans-serif; }
    .details-row:last-child { margin-bottom: 0; }
    .details-label { display: table-cell; font-size: 13px; font-weight: 500; color: #808080; text-transform: uppercase; letter-spacing: 1px; width: 40%; }
    .details-value { display: table-cell; font-size: 14px; font-weight: 400; color: #1a1a1a; text-align: right; }
    .amount-value { font-family: 'Playfair Display', serif; font-size: 26px; color: #d4af37; font-weight: 600; }
    .tax-box { border-left: 2px solid #d4af37; padding-left: 16px; margin-bottom: 40px; }
    .tax-text { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: #666666; line-height: 1.6; margin: 0; }
    .signoff { font-family: 'Playfair Display', serif; font-size: 18px; font-style: italic; color: #1a1a1a; margin: 0 0 40px 0; }
    .cta-container { text-align: center; margin-bottom: 50px; }
    .cta-button { font-family: 'Inter', sans-serif; display: inline-block; padding: 14px 36px; background-color: transparent; border: 1px solid #1a1a1a; color: #1a1a1a; text-decoration: none; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s ease; }
    .footer { background-color: #faf9f6; padding: 40px; text-align: center; border-top: 1px solid #f0f0f0; }
    .footer-text { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #999999; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div style="background-color: #faf9f6; padding: 40px 20px;">
    <div class="email-container">
      
      <!-- Header -->
      <div class="header">
        <div class="logo-container">
          <img src="cid:logo" alt="Patel Foundation" width="160" draggable="false" style="display: block; margin: 0 auto; pointer-events: none;">
        </div>
        <div class="brand-accent"></div>
        <p class="receipt-title">Official Receipt</p>
        <p class="receipt-title" style="margin-top: 8px; color: #1a1a1a;">Patel Foundation</p>
      </div>

      <!-- Content -->
      <div class="content-area">
        <h2 class="greeting">Dear ${donorName},</h2>
        <p class="message">
          On behalf of the Patel Foundation, thank you for your generous contribution. Your support is instrumental in advancing our mission to provide education, healthcare, and nutrition to those who need it most.
        </p>

        <!-- Details -->
        <div class="details-card">
          <div class="details-row" style="margin-bottom: 24px;">
            <div class="details-label" style="vertical-align: middle;">Contribution</div>
            <div class="details-value amount-value">$${amount} <span style="font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 400; color: #808080;">${currency}</span></div>
          </div>
          <div class="details-row">
            <div class="details-label">Date</div>
            <div class="details-value">${date}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Reference</div>
            <div class="details-value" style="font-family: monospace; color: #666666; font-size: 12px;">${transactionId}</div>
          </div>
        </div>

        <!-- Tax Info -->
        <div class="tax-box">
          <p class="tax-text">
            <strong>Tax Deduction Notice:</strong> The Patel Foundation is a registered 501(c)(3) nonprofit organization. No goods or services were provided in exchange for this contribution. Please retain this statement for your tax records.
          </p>
        </div>

        <p class="signoff">With profound gratitude,<br>The Patel Foundation Team</p>

        <div class="cta-container">
          <a href="${frontendUrl}" class="cta-button">Visit Our Website</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          <strong style="color: #666666;">Patel Foundation</strong><br>
          Kavitha Village, India<br>
          <a href="mailto:patelfoundation23@gmail.com" style="color: #999999; text-decoration: none;">patelfoundation23@gmail.com</a>
          <br><br>
          This is an automated receipt. Please do not reply to this email.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`,
  };

  try {
    await transporter.sendMail({ ...mailOptions, attachments: [LOGO_ATTACHMENT] });
    console.log(`[Email] Receipt sent to donor: ${donor.email}`);
    logEmail(donor.email, `Donation Receipt — Thank You!`, 'receipt', 'sent', null, donor.source || 'USA');
  } catch (error) {
    console.error(`[Email] Failed to send receipt. Error:`, error.message);
    logEmail(donor.email, `Donation Receipt — Thank You!`, 'receipt', 'failed', error.message, donor.source || 'USA');
  }
};

// ─── Admin Notification Email (Ultra-Premium Light Theme) ───────────────────
const sendAdminNotification = async (donor) => {
  console.log(`[Email Trace] sendAdminNotification called for donor: ${donor.email}`);
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email Trace] RESEND_API_KEY not configured. Skipping sendAdminNotification.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const donorName = donor.isAnonymous ? 'Anonymous Donor' : (donor.name || 'Unknown');
  const amount = donor.amount ? donor.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
  const currency = donor.currency || 'USD';
  const date = new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const transactionId = donor.transactionId || donor.customId || 'N/A';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

  const transporter = createTransporter();
  const mailOptions = {
    from: `Patel Foundation <${process.env.EMAIL_FROM || 'donations@patelfoundation.org'}>`,
    to: adminEmail,
    subject: `New Donation: $${amount} received from ${donorName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Notification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; background-color: #f5f5f5; -webkit-font-smoothing: antialiased; }
    .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; }
    .top-bar { height: 4px; background-color: #1a1a1a; width: 100%; }
    .header { padding: 40px; border-bottom: 1px solid #f0f0f0; pointer-events: none; }
    img { pointer-events: none; -webkit-user-drag: none; }
    .alert-label { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; color: #808080; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; }
    .alert-title { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 500; color: #1a1a1a; margin: 0; letter-spacing: -0.5px; }
    .amount-section { padding: 40px; background-color: #faf9f6; text-align: center; border-bottom: 1px solid #f0f0f0; }
    .amount-label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; color: #808080; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0; }
    .amount-value { font-family: 'Inter', sans-serif; font-size: 42px; font-weight: 300; color: #1a1a1a; margin: 0; letter-spacing: -2px; }
    .amount-currency { font-size: 16px; color: #808080; vertical-align: super; font-weight: 400; }
    .content-area { padding: 40px; }
    .details-table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; }
    .details-row td { padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
    .details-row:last-child td { border-bottom: none; }
    .details-label { font-size: 13px; font-weight: 500; color: #808080; width: 40%; }
    .details-value { font-size: 14px; font-weight: 400; color: #1a1a1a; text-align: right; }
    .tag-anon { display: inline-block; background-color: #f5f5f5; color: #666666; font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 2px; text-transform: uppercase; margin-left: 8px; vertical-align: middle; }
    .tag-source { display: inline-block; border: 1px solid #e0e0e0; color: #666666; font-size: 10px; font-weight: 500; padding: 3px 8px; border-radius: 2px; text-transform: uppercase; }
    .cta-container { padding: 0 40px 40px; text-align: center; }
    .cta-button { font-family: 'Inter', sans-serif; display: inline-block; padding: 14px 36px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; transition: background-color 0.3s; }
    .footer { padding: 30px 40px; text-align: center; background-color: #faf9f6; border-top: 1px solid #eaeaea; }
    .footer-text { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #999999; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div style="background-color: #f5f5f5; padding: 40px 20px;">
    <div class="email-container">
      
      <div class="top-bar"></div>
      
      <!-- Header -->
      <div class="header">
        <div style="margin-bottom: 20px;">
          <img src="cid:logo" alt="Patel Foundation" width="120" draggable="false" style="display: block; pointer-events: none;">
        </div>
        <p class="alert-label">System Notification</p>
        <h1 class="alert-title">New Donation Received</h1>
      </div>

      <!-- Big Amount -->
      <div class="amount-section">
        <p class="amount-label">Verified Contribution</p>
        <p class="amount-value"><span style="font-size: 24px; vertical-align: top; line-height: 2;">$</span>${amount} <span class="amount-currency">${currency}</span></p>
      </div>

      <!-- Details -->
      <div class="content-area">
        <table class="details-table">
          <tr class="details-row">
            <td class="details-label">Donor</td>
            <td class="details-value">
              ${donorName}
              ${donor.isAnonymous ? '<span class="tag-anon">Anonymous</span>' : ''}
            </td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Email</td>
            <td class="details-value">
              <a href="mailto:${donor.email}" style="color: #666666; text-decoration: none;">${donor.email}</a>
            </td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Phone</td>
            <td class="details-value">${donor.phone || '—'}</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Date</td>
            <td class="details-value">${date}</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Method</td>
            <td class="details-value">
              <span class="tag-source">PayPal</span>
            </td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Reference</td>
            <td class="details-value" style="font-family: monospace; font-size: 12px; color: #808080;">${transactionId}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div class="cta-container">
        <a href="${frontendUrl}/admin" class="cta-button">Open Dashboard</a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          Automated transactional message from Patel Foundation.<br>
          Please retain for administrative records.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`,
  };

  try {
    await transporter.sendMail({ ...mailOptions, attachments: [LOGO_ATTACHMENT] });
    console.log(`[Email] Admin notification sent to: ${adminEmail}`);
    logEmail(adminEmail, `New Donation Received`, 'admin_alert', 'sent', null, donor.source || 'USA');
  } catch (error) {
    console.error(`[Email] Failed to send admin notification. Error:`, error.message);
    logEmail(adminEmail, `New Donation Received`, 'admin_alert', 'failed', error.message, donor.source || 'USA');
  }
};

// ─── Inquiry Acknowledgment Email (Luxury Minimalist) ────────────────────────
const sendInquiryAcknowledgment = async (inquiry) => {
  console.log(`[Email Trace] sendInquiryAcknowledgment called for inquiry: ${inquiry.email}`);
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email Trace] RESEND_API_KEY not configured. Skipping sendInquiryAcknowledgment.');
    return;
  }

  const { name, email, type } = inquiry;
  const isVolunteer = type === 'volunteer';
  const mainTitle = isVolunteer ? 'A Journey Together' : 'Thank You For Reaching Out';
  const subTitle = isVolunteer ? 'Volunteer Application Received' : 'Message Received';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const transporter = createTransporter();
  const mailOptions = {
    from: `Patel Foundation <${process.env.EMAIL_FROM || 'donations@patelfoundation.org'}>`,
    to: email,
    subject: `Regarding your ${type} inquiry — Patel Foundation`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600&display=swap');
    body { margin: 0; padding: 0; background-color: #faf9f6; }
    img { pointer-events: none; -webkit-user-drag: none; }
    .email-wrapper { background-color: #faf9f6; padding: 60px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 80px 40px; text-align: center; border: 1px solid #f0efeb; }
    .logo-text { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; letter-spacing: -1px; }
    .logo-sub { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; color: #d4af37; text-transform: uppercase; letter-spacing: 3px; margin: 0; }
    .divider { width: 40px; height: 1px; background-color: #f0efeb; margin: 50px auto; }
    .title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: #1a1a1a; margin-bottom: 24px; line-height: 1.2; }
    .body-text { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 300; color: #4a4a4a; line-height: 1.8; margin-bottom: 40px; }
    .signature { font-family: 'Playfair Display', serif; font-size: 18px; font-style: italic; color: #1a1a1a; margin-top: 50px; }
    .footer { margin-top: 60px; font-family: 'Inter', sans-serif; font-size: 10px; color: #999; letter-spacing: 1px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div style="margin-bottom: 30px;">
        <img src="cid:logo" alt="Patel Foundation" width="180" draggable="false" style="display: block; margin: 0 auto; pointer-events: none;">
      </div>
      <p class="logo-sub">${subTitle}</p>
      
      <div class="divider"></div>
      
      <h1 class="title">${mainTitle}</h1>
      
      <p class="body-text">
        Dear ${name},<br><br>
        We have received your ${isVolunteer ? 'application to join our volunteer network' : 'message regarding our recent initiatives'}. 
        At Patel Foundation, we believe every interaction is a step towards a more empowered future.
      </p>
      
      <p class="body-text" style="font-weight: 400; color: #1a1a1a;">
        Our team is currently reviewing your details. You can expect a personalized response within the next 24 to 48 hours.
      </p>
      
      <p class="body-text">
        In the meantime, we invite you to explore our latest updates and stories of impact on our digital platform.
      </p>

      <div class="signature">With Gratitude,<br>The Patel Foundation</div>
      
      <div class="footer">Sent on ${date} · Official Correspondence</div>
    </div>
  </div>
</body>
</html>`,
  };

  try {
    await transporter.sendMail({ ...mailOptions, attachments: [LOGO_ATTACHMENT] });
    logEmail(email, `Inquiry Acknowledgment`, 'acknowledgment', 'sent', null, inquiry.source || 'USA');
  } catch (e) {
    logEmail(email, `Inquiry Acknowledgment`, 'acknowledgment', 'failed', e.message, inquiry.source || 'USA');
  }
};

// ─── Event Registration Receipt (Premium Dark/Gold Theme) ───────────────────
const sendEventRegistrationReceipt = async (registration) => {
  console.log(`[Email Trace] sendEventRegistrationReceipt called for: ${registration.email}`);
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email Trace] RESEND_API_KEY not configured. Skipping sendEventRegistrationReceipt.');
    return;
  }

  const { fullName, email, ticketType, guests, amount, customId, currency = 'USD' } = registration;
  const eventDate = "Saturday, October 24, 2026";
  const eventTime = "6:30 PM EST onwards";
  const eventLocation = "The Grand Ballroom, NY";
  const dateFormatted = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const amountFormatted = typeof amount === 'number' ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount;
  const frontendUrl = process.env.FRONTEND_URL || 'https://mypatelfoundation.org';

  const transporter = createTransporter();
  const mailOptions = {
    from: `Patel Foundation <${process.env.EMAIL_FROM || 'donations@patelfoundation.org'}>`,
    to: email,
    subject: `Your E-Ticket Confirmed — ${fullName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Registration Confirmation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; background-color: #faf9f6; -webkit-font-smoothing: antialiased; }
    .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { text-align: center; padding: 60px 40px 40px; background-color: #ffffff; }
    .logo-container { margin-bottom: 24px; pointer-events: none; }
    img { pointer-events: none; -webkit-user-drag: none; }
    .brand-accent { width: 40px; height: 1px; background-color: #d4af37; margin: 16px auto; }
    .receipt-title { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; color: #808080; text-transform: uppercase; letter-spacing: 3px; margin: 0; }
    .content-area { padding: 0 50px 50px; }
    .greeting { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; color: #1a1a1a; margin: 0 0 20px 0; }
    .message { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 300; color: #4a4a4a; line-height: 1.8; margin: 0 0 40px 0; }
    .details-card { background-color: #faf9f6; padding: 32px; margin-bottom: 40px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
    .details-row { display: table; width: 100%; margin-bottom: 16px; font-family: 'Inter', sans-serif; }
    .details-row:last-child { margin-bottom: 0; }
    .details-label { display: table-cell; font-size: 13px; font-weight: 500; color: #808080; text-transform: uppercase; letter-spacing: 1px; width: 40%; }
    .details-value { display: table-cell; font-size: 14px; font-weight: 400; color: #1a1a1a; text-align: right; }
    .amount-value { font-family: 'Playfair Display', serif; font-size: 26px; color: #d4af37; font-weight: 600; }
    .event-info-box { border-left: 2px solid #d4af37; padding-left: 16px; margin-bottom: 40px; }
    .event-info-text { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: #666666; line-height: 1.6; margin: 0; }
    .signoff { font-family: 'Playfair Display', serif; font-size: 18px; font-style: italic; color: #1a1a1a; margin: 0 0 40px 0; }
    .cta-container { text-align: center; margin-bottom: 50px; }
    .cta-button { font-family: 'Inter', sans-serif; display: inline-block; padding: 14px 36px; background-color: transparent; border: 1px solid #1a1a1a; color: #1a1a1a; text-decoration: none; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s ease; }
    .footer { background-color: #faf9f6; padding: 40px; text-align: center; border-top: 1px solid #f0f0f0; }
    .footer-text { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #999999; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div style="background-color: #faf9f6; padding: 40px 20px;">
    <div class="email-container">
      
      <!-- Header -->
      <div class="header">
        <div class="logo-container">
          <img src="cid:logo" alt="Patel Foundation" width="160" draggable="false" style="display: block; margin: 0 auto; pointer-events: none;">
        </div>
        <div class="brand-accent"></div>
        <p class="receipt-title">Event Confirmation</p>
        <p class="receipt-title" style="margin-top: 8px; color: #1a1a1a;">Empowering Futures Gala</p>
      </div>

      <!-- Content -->
      <div class="content-area">
        <h2 class="greeting">Dear ${fullName},</h2>
        <p class="message">
          We are honored to confirm your presence at the upcoming Empowering Futures Gala. Your contribution directly supports our mission to provide education, healthcare, and nutrition to those who need it most. We look forward to seeing you there.
        </p>

        <!-- Details -->
        <div class="details-card">
          <div class="details-row" style="margin-bottom: 24px;">
            <div class="details-label" style="vertical-align: middle;">Contribution</div>
            <div class="details-value amount-value">$${amountFormatted} <span style="font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 400; color: #808080;">${currency}</span></div>
          </div>
          <div class="details-row">
            <div class="details-label">Ticket Type</div>
            <div class="details-value">${ticketType} Admission</div>
          </div>
          <div class="details-row">
            <div class="details-label">Guests</div>
            <div class="details-value">${guests} Person(s)</div>
          </div>
          <div class="details-row">
            <div class="details-label">Confirmation Date</div>
            <div class="details-value">${dateFormatted}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Reference</div>
            <div class="details-value" style="font-family: monospace; color: #666666; font-size: 12px;">${customId}</div>
          </div>
        </div>

        <!-- Event Info Box -->
        <div class="event-info-box">
          <p class="event-info-text">
            <strong>Event Details:</strong><br>
            ${eventDate}<br>
            ${eventTime}<br>
            ${eventLocation}
          </p>
        </div>

        <p class="signoff">With profound gratitude,<br>The Patel Foundation Team</p>

        <div class="cta-container">
          <a href="${frontendUrl}" class="cta-button">Visit Our Website</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          <strong style="color: #666666;">Patel Foundation</strong><br>
          Kavitha Village, India<br>
          <a href="mailto:patelfoundation23@gmail.com" style="color: #999999; text-decoration: none;">patelfoundation23@gmail.com</a>
          <br><br>
          Please present this confirmation at the registration desk. This is an automated message.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`,
  };

  try {
    await transporter.sendMail({ ...mailOptions, attachments: [LOGO_ATTACHMENT] });
    console.log(`[Email] Event receipt sent to: ${email}`);
    logEmail(email, `Event Ticket Confirmed`, 'event_receipt', 'sent', null, 'USA');
  } catch (error) {
    console.error(`[Email] Failed to send event receipt. Error:`, error.message);
    logEmail(email, `Event Ticket Confirmed`, 'event_receipt', 'failed', error.message, 'USA');
  }
};

// ─── Admin Event Notification (High Priority) ───────────────────────────────
const sendEventAdminNotification = async (registration) => {
  console.log(`[Email Trace] sendEventAdminNotification called for registration: ${registration.email}`);
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email Trace] RESEND_API_KEY not configured. Skipping sendEventAdminNotification.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const { fullName, email, phone, ticketType, guests, amount, customId, currency = 'USD' } = registration;
  const date = new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const amountFormatted = typeof amount === 'number' ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount;
  const frontendUrl = process.env.FRONTEND_URL || 'https://mypatelfoundation.org';

  const transporter = createTransporter();
  const mailOptions = {
    from: `Patel Foundation <${process.env.EMAIL_FROM || 'donations@patelfoundation.org'}>`,
    to: adminEmail,
    subject: `Ticket Sold: $${amountFormatted} from ${fullName} [${ticketType}]`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Event Notification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; background-color: #f5f5f5; -webkit-font-smoothing: antialiased; }
    .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; }
    .top-bar { height: 4px; background-color: #d4af37; width: 100%; }
    .header { padding: 40px; border-bottom: 1px solid #f0f0f0; pointer-events: none; }
    img { pointer-events: none; -webkit-user-drag: none; }
    .alert-label { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; color: #808080; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; }
    .alert-title { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 500; color: #1a1a1a; margin: 0; letter-spacing: -0.5px; }
    .amount-section { padding: 40px; background-color: #faf9f6; text-align: center; border-bottom: 1px solid #f0f0f0; }
    .amount-label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; color: #808080; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0; }
    .amount-value { font-family: 'Inter', sans-serif; font-size: 42px; font-weight: 300; color: #1a1a1a; margin: 0; letter-spacing: -2px; }
    .amount-currency { font-size: 16px; color: #808080; vertical-align: super; font-weight: 400; }
    .content-area { padding: 40px; }
    .details-table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; }
    .details-row td { padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
    .details-row:last-child td { border-bottom: none; }
    .details-label { font-size: 13px; font-weight: 500; color: #808080; width: 40%; }
    .details-value { font-size: 14px; font-weight: 400; color: #1a1a1a; text-align: right; }
    .tag-source { display: inline-block; border: 1px solid #e0e0e0; color: #666666; font-size: 10px; font-weight: 500; padding: 3px 8px; border-radius: 2px; text-transform: uppercase; }
    .cta-container { padding: 0 40px 40px; text-align: center; }
    .cta-button { font-family: 'Inter', sans-serif; display: inline-block; padding: 14px 36px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; transition: background-color 0.3s; }
    .footer { padding: 30px 40px; text-align: center; background-color: #faf9f6; border-top: 1px solid #eaeaea; }
    .footer-text { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #999999; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div style="background-color: #f5f5f5; padding: 40px 20px;">
    <div class="email-container">
      
      <div class="top-bar"></div>
      
      <!-- Header -->
      <div class="header">
        <div style="margin-bottom: 20px;">
          <img src="cid:logo" alt="Patel Foundation" width="120" draggable="false" style="display: block; pointer-events: none;">
        </div>
        <p class="alert-label">Event Alert</p>
        <h1 class="alert-title">New Gala Registration</h1>
      </div>

      <!-- Big Amount -->
      <div class="amount-section">
        <p class="amount-label">Verified Ticket Sale</p>
        <p class="amount-value"><span style="font-size: 24px; vertical-align: top; line-height: 2;">$</span>${amountFormatted} <span class="amount-currency">${currency}</span></p>
      </div>

      <!-- Details -->
      <div class="content-area">
        <table class="details-table">
          <tr class="details-row">
            <td class="details-label">Guest</td>
            <td class="details-value">${fullName}</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Email</td>
            <td class="details-value">
              <a href="mailto:${email}" style="color: #666666; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Phone</td>
            <td class="details-value">${phone || '—'}</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Ticket</td>
            <td class="details-value">${ticketType} (${guests} Guests)</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Date</td>
            <td class="details-value">${date}</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Reference</td>
            <td class="details-value" style="font-family: monospace; font-size: 12px; color: #808080;">${customId}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div class="cta-container">
        <a href="${frontendUrl}/admin" class="cta-button">Open Dashboard</a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          Automated event notification from Patel Foundation.<br>
          Please retain for administrative records.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`,
  };

  try {
    await transporter.sendMail({ ...mailOptions, attachments: [LOGO_ATTACHMENT] });
    console.log(`[Email] Admin event notification sent to: ${adminEmail}`);
    logEmail(adminEmail, `Ticket Sold Alert`, 'admin_event_alert', 'sent', null, 'USA');
  } catch (error) {
    console.error(`[Email] Failed to send admin event notification. Error:`, error.message);
    logEmail(adminEmail, `Ticket Sold Alert`, 'admin_event_alert', 'failed', error.message, 'USA');
  }
};

module.exports = {
  sendDonationReceipt,
  sendAdminNotification,
  sendInquiryAcknowledgment,
  sendEventRegistrationReceipt,
  sendEventAdminNotification,
};
