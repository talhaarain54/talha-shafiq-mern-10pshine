import nodemailer from "nodemailer";
import logger from "./logger.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (user, verificationToken) => {
  if (process.env.NODE_ENV === 'test') return;
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"NoteBase" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify your NoteBase account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; padding: 48px 40px; }
          .logo { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 32px; }
          .logo span { color: #2563eb; }
          h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
          p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
          .btn { display: inline-block; background: #2563eb; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
          .footer { color: #94a3b8; font-size: 13px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Note<span>Base</span></div>
          <h1>Verify your email address</h1>
          <p>Hi ${user.name}, thanks for signing up! Click the button below to verify your email and activate your account.</p>
          <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          <p class="footer">This link expires in <strong>24 hours</strong>. If you didn't create a NoteBase account, ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${user.email}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Failed to send verification email to ${user.email}: ${err.message}`);
    throw err;
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  if (process.env.NODE_ENV === 'test') return;
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"NoteBase" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Reset your NoteBase password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; padding: 48px 40px; }
          .logo { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 32px; }
          .logo span { color: #2563eb; }
          h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
          p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
          .btn { display: inline-block; background: #0f172a; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; }
          .warning { background: #fef9c3; border: 1px solid #fde047; border-radius: 10px; padding: 12px 16px; color: #854d0e; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Note<span>Base</span></div>
          <h1>Reset your password</h1>
          <p>Hi ${user.name}, we received a request to reset your NoteBase password.</p>
          <a href="${resetUrl}" class="btn">Reset Password</a>
          <br/><br/>
          <div class="warning">⚠️ This link expires in <strong>1 hour</strong>. If you didn't request this, ignore it — your account is safe.</div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${user.email}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Failed to send reset email to ${user.email}: ${err.message}`);
    throw err;
  }
};