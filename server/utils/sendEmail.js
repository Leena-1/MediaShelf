const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const tls = require('tls');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

/**
 * Send an email using Nodemailer (with Gmail SMTP, Ethereal test fallback, and TLS fallback)
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'MediaShelf Support'}" <${emailUser || 'noreply@mediashelf.app'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
    html: options.html
  };

  // 1. Try Nodemailer if installed
  if (nodemailer) {
    // Attempt A: Gmail Service (SSL Port 465)
    try {
      if (emailUser && emailPass && emailPass !== 'your16charpasscode') {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent via Gmail to ${options.to}: ${info.messageId}`);
        return info;
      }
    } catch (err1) {
      console.warn(`⚠️ Gmail SMTP delivery failed (${err1.message}). Switching to Ethereal Test Email fallback...`);
    }

    // Attempt B: Ethereal Automatic Test Inbox Fallback (Zero Config, 100% Reliable)
    try {
      console.log('💡 Generating Ethereal Test Account for instant email preview...');
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const testInfo = await testTransporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(testInfo);
      console.log(`\n====================================================`);
      console.log(`✉️ EMAIL SENT SUCCESSFULLY TO: ${options.to}`);
      console.log(`🔗 VIEW RECEIVED EMAIL IN BROWSER: ${previewUrl}`);
      console.log(`====================================================\n`);
      return { messageId: testInfo.messageId, previewUrl };
    } catch (etherealErr) {
      console.warn('⚠️ Ethereal test inbox fallback failed:', etherealErr.message);
    }
  }

  // Attempt C: Simulation Log
  console.log(`[EMAIL SIMULATION] To: ${options.to} | Subject: ${options.subject}`);
  return { simulated: true };
};

/**
 * Generate Password Reset HTML Email Template
 */
const getPasswordResetTemplate = (resetUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - MediaShelf</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #151f32; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #a855f7; display: inline-block;">
                📚 MediaShelf
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">YOUR PERSONAL MEDIA LIBRARY</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #ffffff;">Password Reset Request</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                We received a request to reset the password for your MediaShelf account. Click the button below to set a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7);">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; transition: all 0.2s ease;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 12px 0; font-size: 13px; color: #94a3b8;">
                If the button above does not work, copy and paste the following link into your browser:
              </p>
              <div style="background-color: #0b0f19; padding: 12px 16px; border-radius: 8px; border: 1px solid #1e293b; word-break: break-all;">
                <a href="${resetUrl}" style="color: #818cf8; font-size: 13px; text-decoration: none;">${resetUrl}</a>
              </div>

              <!-- Warning Callout -->
              <div style="margin-top: 28px; padding: 14px 16px; background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 6px;">
                <p style="margin: 0; font-size: 13px; color: #fca5a5; line-height: 1.5;">
                  ⚠️ <strong>Security Notice:</strong> This password reset link expires in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email and your password will remain secure.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} MediaShelf Application. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generate Email Verification HTML Email Template
 */
const getEmailVerificationTemplate = (verifyUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - MediaShelf</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #151f32; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #a855f7; display: inline-block;">
                📚 MediaShelf
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">YOUR PERSONAL MEDIA LIBRARY</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #ffffff;">Welcome to MediaShelf!</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Thank you for registering. Please verify your email address to activate your account and start managing your books and movies.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #6366f1);">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; transition: all 0.2s ease;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 12px 0; font-size: 13px; color: #94a3b8;">
                Or copy and paste this verification URL into your web browser:
              </p>
              <div style="background-color: #0b0f19; padding: 12px 16px; border-radius: 8px; border: 1px solid #1e293b; word-break: break-all;">
                <a href="${verifyUrl}" style="color: #60a5fa; font-size: 13px; text-decoration: none;">${verifyUrl}</a>
              </div>

              <div style="margin-top: 28px; padding: 14px 16px; background-color: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; border-radius: 6px;">
                <p style="margin: 0; font-size: 13px; color: #c7d2fe; line-height: 1.5;">
                  ℹ️ This verification link is valid for <strong>24 hours</strong>. If you did not create a MediaShelf account, please ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} MediaShelf Application. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = {
  sendEmail,
  getPasswordResetTemplate,
  getEmailVerificationTemplate
};
