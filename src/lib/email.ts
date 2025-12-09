import { Resend } from "resend";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string) {
  if (!resend) {
    console.error("Resend API key not configured. Email not sent.");
    throw new Error("Email service not configured");
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Venom Elite Fitness <noreply@venomfitness.com>",
      to: email,
      subject: "Reset Your Password - Venom Elite Fitness",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid #dc2626; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Venom Elite Fitness</h1>
                        <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Reset Password</p>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px;">Hello ${name},</h2>
                        <p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                          We received a request to reset the password for your account at Venom Elite Fitness.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                          Click the button below to create a new password. This link will expire in 1 hour.
                        </p>
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        <!-- Alternative Link -->
                        <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #dc2626; font-size: 12px; word-break: break-all;">
                          ${resetUrl}
                        </p>
                        <!-- Warning -->
                        <p style="margin: 30px 0 0 0; color: #ef4444; font-size: 14px; line-height: 1.6; padding: 15px; background-color: rgba(220, 38, 38, 0.1); border-left: 3px solid #dc2626; border-radius: 4px;">
                          <strong>⚠️ Important:</strong> If you didn't request this change, please ignore this email. Your password will remain unchanged.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 30px; text-align: center; background-color: #0a0a0a; border-top: 1px solid #1f1f1f;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                          © ${new Date().getFullYear()} Venom Elite Fitness. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Error in sendPasswordResetEmail:", error);
    throw error;
  }
}

