import nodemailer from 'nodemailer';

// Support two modes:
// 1) GMAIL_USER + GMAIL_PASS (recommended for Gmail with an app password)
// 2) SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS (classic SMTP)

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || GMAIL_USER || SMTP_USER || 'no-reply@pizzahub.local';

let transporter;

if (GMAIL_USER && GMAIL_PASS) {
  // Use Gmail service with app password (works with 2FA accounts)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });
} else if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  console.warn('No mail credentials found (GMAIL_USER/GMAIL_PASS or SMTP_*). Emails will not be sent.');
  // Use jsonTransport so sendMail does not throw during development; messages will be returned as JSON.
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111827; line-height:1.4;">
    <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <div style="text-align:center;margin-bottom:18px;">
        <h1 style="margin:0;font-size:20px;color:#ef4444">PizzaHub</h1>
        <p style="margin:6px 0 0;color:#6b7280">Verify your email to complete registration</p>
      </div>

      <div style="background:#fff;padding:18px;border-radius:8px;border:1px solid #f3f4f6;margin-bottom:16px;text-align:center;">
        <p style="margin:0 0 12px;color:#374151">Hi ${escapeHtml(name || '')},</p>
        <p style="margin:0 0 18px;color:#374151">Use the code below to verify your email address. This code will expire in 15 minutes.</p>
        <div style="display:inline-block;padding:12px 18px;border-radius:8px;background:linear-gradient(90deg,#fef3c7,#fee2b3);font-weight:700;font-size:22px;letter-spacing:6px;color:#111827">${escapeHtml(code)}</div>
      </div>

      <p style="color:#6b7280;font-size:13px;margin-bottom:8px">If you didn't request this, you can safely ignore this email.</p>
      <p style="color:#6b7280;font-size:13px">Thanks,<br/>PizzaHub Team</p>
    </div>
  </div>
  `;

  const plain = `Hello ${name || ''},\n\nUse the code ${code} to verify your email. The code will expire in 15 minutes.\n\nThanks,\nPizzaHub Team`;

  return transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: 'Verify your PizzaHub account',
    text: plain,
    html,
  });
}

function escapeHtml(input: string) {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
