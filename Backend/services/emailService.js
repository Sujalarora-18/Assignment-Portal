const nodemailer = require("nodemailer");

// Create email transporter
// NOTE: SMTP_PORT must be parsed as a number — .env values are always strings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certs in dev environments
  },
});

/**
 * Verify SMTP connection at startup
 */
async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log("✅ SMTP transporter ready — emails will work fine");
    return true;
  } catch (err) {
    console.error("❌ SMTP transporter FAILED to connect:", err.message);
    console.error("   → Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env");
    return false;
  }
}

/**
 * Generate a random OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email
 */
async function sendOTPEmail(email, otp, userName) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "CampusFlow - Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">CampusFlow</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Thank you for signing up! Your email verification OTP is:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0; letter-spacing: 5px;">${otp}</p>
          </div>
          <p style="color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="text-align: center; color: #999; font-size: 12px;">© 2026 CampusFlow. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Error sending OTP email: ${err.message}`);
    return false;
  }
}

/**
 * Send welcome email after verification
 */
async function sendWelcomeEmail(email, userName) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to CampusFlow!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">Welcome to CampusFlow</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your email has been verified successfully! You can now log in to your account and start managing your assignments.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Go to CampusFlow</a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="text-align: center; color: #999; font-size: 12px;">© 2026 CampusFlow. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Error sending welcome email: ${err.message}`);
    return false;
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  verifyTransporter,
};
