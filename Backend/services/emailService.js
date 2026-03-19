/**
 * Brevo HTTP API Email Service
 * Uses native fetch to send emails via Brevo's REST API (port 443)
 * This avoids Render's outbound SMTP (port 587) block.
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Ensure we have required variables at runtime
// The user has placed their API key in SMTP_PASS and sender email in SMTP_USER
function getBrevoConfig() {
  return {
    apiKey: process.env.SMTP_PASS, // User provided API key here
    senderEmail: process.env.SMTP_USER || "noreply@campusflow.com", 
    senderName: "CampusFlow",
  };
}

/**
 * Verify Brevo API connection at startup
 */
async function verifyTransporter() {
  const { apiKey } = getBrevoConfig();
  if (!apiKey) {
    console.error("❌ Brevo API key (stored in SMTP_PASS) is missing.");
    return false;
  }
  // Optional: Could do a test fetch here to Brevo's account/profile endpoint,
  // but just checking if the key exists is enough for startup logging for now.
  console.log("✅ Brevo HTTP API Email Service ready");
  return true;
}

/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Internal helper to send via Brevo API using native Node fetch
 */
async function sendBrevoEmail(toEmail, toName, subject, htmlContent) {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: toName || toEmail.split('@')[0] }],
    subject: subject,
    htmlContent: htmlContent,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Brevo API Error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (err) {
    console.error("Brevo API Request Failed:", err.message);
    throw err;
  }
}

/**
 * Send OTP email
 */
async function sendOTPEmail(email, otp, userName) {
  try {
    const htmlContent = `
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
    `;

    await sendBrevoEmail(email, userName, "CampusFlow - Email Verification OTP", htmlContent);
    console.log(`✅ OTP email sent to ${email} via Brevo API`);
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
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to CampusFlow</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Your email has been verified successfully! You can now log in to your account and start managing your assignments.</p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${frontendUrl}" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Go to CampusFlow</a>
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">© 2026 CampusFlow. All rights reserved.</p>
      </div>
    `;

    await sendBrevoEmail(email, userName, "Welcome to CampusFlow!", htmlContent);
    console.log(`✅ Welcome email sent to ${email} via Brevo API`);
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
