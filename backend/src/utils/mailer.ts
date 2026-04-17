import nodemailer from "nodemailer";

// ✅ Declare transporter ONCE with type
let transporter: nodemailer.Transporter;

// Support two modes:
// 1) GMAIL_USER + GMAIL_PASS
// 2) SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || GMAIL_USER || SMTP_USER || 'no-reply@cravinoz.local';

// ✅ Initialize transporter (ONLY ONCE)
if (GMAIL_USER && GMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });
} else if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  console.warn('No mail credentials found. Emails will not be sent.');
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

// ✅ Send email function
export async function sendVerificationEmail(to: string, name: string, code: string) {
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;">
    <h2>Cravinoz</h2>
    <p>Hi ${escapeHtml(name || '')},</p>
    <p>Your verification code is:</p>
    <h1>${escapeHtml(code)}</h1>
  </div>
  `;

  const plain = `Hello ${name || ''}, Your code is ${code}`;

  return transporter.sendMail({
    from: EMAIL_FROM, // ✅ added (important)
    to,
    subject: 'Verify your Cravinoz account',
    text: plain,
    html,
  });
}

// ✅ Helper
function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}