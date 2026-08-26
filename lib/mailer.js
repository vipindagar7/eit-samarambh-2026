import nodemailer from "nodemailer";
import config from "./config";

// SMTP transporter — configure in .env.local:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=your@gmail.com
//   SMTP_PASS=your-app-password   (Gmail: use an App Password, not your login password)
//   SMTP_FROM="Samarambh <your@gmail.com>"   (optional, defaults to SMTP_USER)
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

function emailTemplate({ name, ticketId }) {
  const { fest, artist } = config;
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#1a0b2e; padding:32px 16px; color:#fdf6ec;">
    <div style="max-width:480px; margin:0 auto; background:#2d1145; border-radius:20px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
      <div style="padding:32px 28px 8px;">
        <p style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#ffb020; margin:0 0 8px;">
          ${fest.collegeShort} presents
        </p>
        <h1 style="font-size:26px; margin:0 0 20px; color:#fdf6ec;">${fest.name}</h1>
      </div>

      <div style="padding:0 28px 24px;">
        <p style="font-size:16px; margin:0 0 16px;">Hi ${name},</p>

        <p style="font-size:15px; line-height:1.6; color:#fdf6ec; margin:0 0 16px;">
          Your Star Night registration is confirmed!
        </p>

        <p style="font-size:15px; line-height:1.6; color:#c9b8d9; margin:0 0 24px;">
          Get ready for ${fest.name}, an evening filled with music, energy, and memories you'll carry with you long after college begins.
        </p>

        <p style="font-size:14px; line-height:2; color:#fdf6ec; margin:0 0 24px;">
          🌟 Star Night featuring ${artist.name}<br/>
          📅 ${fest.date}<br/>
          ⏰ ${fest.time}<br/>
          📍 ${fest.venue}, ${fest.college}
        </p>

        <p style="font-size:14px; line-height:1.6; color:#c9b8d9; margin:0 0 16px;">
          Your registration is valid for Star Night entry only.
        </p>

        <p style="font-size:14px; line-height:1.6; color:#c9b8d9; margin:0 0 24px;">
          Please keep your QR code/ticket ready on your phone and present it at the entry gate for verification.
        </p>

        <div style="text-align:center; margin:24px 0;">
          <img src="cid:ticket-qr" alt="Entry QR code" width="240" height="240" style="display:inline-block; border-radius:12px;" />
          <p style="font-size:12px; color:#c9b8d9; margin-top:10px;">Ticket ID: ${ticketId}</p>
        </div>

        <p style="font-size:15px; line-height:1.6; color:#fdf6ec; margin:0 0 24px;">
          Get ready to sing along, celebrate, and experience a night to remember! ❤️
        </p>

        <p style="font-size:15px; color:#fdf6ec; margin:0;">
          See you at ${fest.name}!
        </p>
      </div>

      <div style="padding:16px 28px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:#c9b8d9;">
        Warm regards,<br/>
        ${fest.college}
      </div>
    </div>
  </div>
  `;
}

// Returns { sent: boolean, skipped?: boolean, error?: string }
export async function sendTicketEmail({ to, name, ticketId, qrBuffer }) {
  const t = getTransporter();
  if (!t) {
    console.warn("[mailer] SMTP not configured — skipping confirmation email.");
    return { sent: false, skipped: true };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await t.sendMail({
      from,
      to,
      subject: `You're in — ${config.fest.name}`,
      html: emailTemplate({ name, ticketId }),
      attachments: [
        {
          filename: "ticket-qr.png",
          content: qrBuffer,
          cid: "ticket-qr",
        },
      ],
    });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] failed to send confirmation email:", err.message);
    return { sent: false, error: err.message };
  }
}