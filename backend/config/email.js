import nodemailer from 'nodemailer';
import logger from './logger.js';

// Use real SMTP when configured, otherwise log to console (development)
const isMailConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  logger.info('Email service configured via SMTP');
} else {
  logger.info('SMTP not configured — emails will be logged to console');
}

const FROM_ADDRESS = process.env.SMTP_FROM || 'Klink <noreply@klink.io>';

/**
 * Send an email. Falls back to console logging when SMTP isn't configured.
 */
export const isSmtpReady = () => isMailConfigured;

export const sendEmail = async ({ to, subject, html }) => {
  if (isMailConfigured) {
    await transporter.sendMail({ from: FROM_ADDRESS, to, subject, html });
    logger.info('Email sent', { to, subject });
  } else {
    logger.info('EMAIL (dev mode — not sent)', { to, subject, html });
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  await sendEmail({
    to: email,
    subject: 'Reset your Klink password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">Reset your password</h2>
        <p style="color:#475569">Click the link below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export const sendVerificationEmail = async (email, verifyUrl) => {
  await sendEmail({
    to: email,
    subject: 'Verify your Klink email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">Verify your email</h2>
        <p style="color:#475569">Click the link below to verify your email address.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0">Verify Email</a>
        <p style="color:#94a3b8;font-size:13px">If you didn't create a Klink account, you can safely ignore this email.</p>
      </div>
    `,
  });
};
