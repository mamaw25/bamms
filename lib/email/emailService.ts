import crypto from 'crypto';

/**
 * Generate a secure random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate token expiration time (24 hours from now)
 */
export function getTokenExpirationTime(): Date {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 24);
  return expirationTime;
}

/**
 * Send verification email using Resend service
 */
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  // Check if Resend API key is available
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Email verification not configured.');
    console.log('Verification URL:', verificationUrl);
    return { success: true, message: 'Email service not configured. Check server logs for verification link.' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'noreply@resend.dev', // Use Resend's default domain (doesn't require verification)
        to: email,
        subject: 'Verify Your Email Address',
        html: generateVerificationEmailHTML(firstName, verificationUrl),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send verification email',
    };
  }
}

/**
 * Generate HTML for verification email
 */
function generateVerificationEmailHTML(firstName: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 40px 20px;
          }
          .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          .link-text {
            font-size: 12px;
            color: #999;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <div class="message">
              Thank you for creating an account! To get started, please verify your email address by clicking the button below:
            </div>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <div class="message">
              If the button doesn't work, copy and paste this link in your browser:
            </div>
            <div class="link-text">${verificationUrl}</div>
            <div class="message" style="margin-top: 30px; font-size: 12px; color: #999;">
              This link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Barangay Attendance System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
