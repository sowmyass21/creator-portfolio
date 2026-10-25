import nodemailer from 'nodemailer';

/**
 * Configure and cache the nodemailer transporter
 */
let transporter = null;
let testAccountCached = null;

export const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const service = process.env.SMTP_SERVICE; // e.g. 'gmail'

  // If explicit SMTP credentials are provided, use them
  if ((host && user && pass) || (service && user && pass)) {
    const config = service 
      ? { service, auth: { user, pass } }
      : {
          host,
          port,
          secure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
          }
        };

    transporter = nodemailer.createTransport(config);
    console.log(`[EmailService] Configured SMTP transporter with ${service || host}:${port}`);
    return transporter;
  }

  // Standalone / Local development mode fallback:
  // If in development and no SMTP is provided, attempt Ethereal test account or local logger
  try {
    if (!testAccountCached) {
      testAccountCached = await nodemailer.createTestAccount();
    }
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccountCached.user,
        pass: testAccountCached.pass
      }
    });
    console.log(`[EmailService] Local dev: Using Ethereal test mailer (${testAccountCached.user})`);
    return transporter;
  } catch (err) {
    console.warn('[EmailService] Notice: Could not init test account, using simulated delivery logger:', err.message);
    transporter = {
      sendMail: async (mailOptions) => {
        return {
          messageId: `simulated_${Date.now()}`,
          simulated: true,
          envelope: { to: [mailOptions.to] }
        };
      }
    };
    return transporter;
  }
};

/**
 * Build rich HTML email template for password reset
 */
const buildResetPasswordHtml = ({ name, resetUrl, expireMinutes = 60 }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - CreatorPulse</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #090D16;
      color: #F8F9FC;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background-color: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      display: inline-block;
      background: linear-gradient(135deg, #6D5EF7 0%, #8B5CF6 100%);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 20px;
      padding: 10px 22px;
      border-radius: 12px;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 24px 0 12px 0;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94A3B8;
      margin: 12px 0;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #6D5EF7;
      color: #FFFFFF !important;
      font-weight: 600;
      font-size: 14px;
      padding: 14px 32px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(109, 94, 247, 0.4);
    }
    .url-box {
      background-color: #131D31;
      border: 1px solid #1E293B;
      border-radius: 10px;
      padding: 14px;
      word-break: break-all;
      font-size: 12px;
      color: #818CF8;
      font-family: monospace;
      margin-top: 15px;
    }
    .footer {
      margin-top: 35px;
      padding-top: 20px;
      border-top: 1px solid #1E293B;
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ CreatorPulse</div>
      <h1>Password Reset Request</h1>
    </div>

    <p>Hi <strong>${name || 'Creator'}</strong>,</p>
    <p>We received a request to reset the password associated with your CreatorPulse account. Click the button below to choose a new password:</p>

    <div class="button-container">
      <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
    </div>

    <p style="font-size: 13px; color: #94A3B8;">
      This link will automatically expire in <strong>${expireMinutes} minutes</strong>.
      If you did not request this password reset, you can safely ignore this email — your account remains completely secure.
    </p>

    <p style="font-size: 12px; color: #64748B; margin-top: 25px;">
      If the button above does not work, copy and paste this link into your web browser:
    </p>
    <div class="url-box">${resetUrl}</div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CreatorPulse Studio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const mailTransporter = await getTransporter();
  const from = process.env.EMAIL_FROM || 'CreatorPulse Support <support@creatorpulse.dev>';

  const mailOptions = {
    from,
    to,
    subject: 'Reset Your CreatorPulse Password',
    text: `Hi ${name || 'Creator'},\n\nYou requested a password reset for your CreatorPulse account.\n\nPlease visit the following link to reset your password (valid for 60 minutes):\n${resetUrl}\n\nIf you did not make this request, you can safely ignore this email.\n\n- The CreatorPulse Team`,
    html: buildResetPasswordHtml({ name, resetUrl, expireMinutes: 60 })
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    
    // Always print prominently in console so local developers can immediately test reset flow
    console.log(`\n========================================================================`);
    console.log(`📨 [EMAIL DISPATCH] Password Reset Instructions Sent`);
    console.log(`   Recipient: ${to}`);
    console.log(`   Reset URL: ${resetUrl}`);
    if (info && info.messageId) {
      console.log(`   Message ID: ${info.messageId}`);
    }
    
    let etherealUrl = null;
    if (nodemailer.getTestMessageUrl && info && !info.simulated) {
      etherealUrl = nodemailer.getTestMessageUrl(info);
      if (etherealUrl) {
        console.log(`   📬 Ethereal Preview URL: ${etherealUrl}`);
      }
    }
    console.log(`========================================================================\n`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: etherealUrl,
      resetUrl,
    };
  } catch (error) {
    console.error('[EmailService] Error dispatching password reset email:', error.message);
    // Don't fail silently, but provide fallback log
    console.log(`[EmailService] Emergency Reset Link for ${to}: ${resetUrl}`);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export default {
  sendPasswordResetEmail,
  getTransporter,
};
