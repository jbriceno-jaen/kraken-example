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
      from: process.env.RESEND_FROM_EMAIL || "Kraken Elite Fitness <noreply@krakenfitness.com>",
      to: email,
      subject: "Restablecer tu contraseña - Kraken Elite Fitness",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer Contraseña</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid #dc2626; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Kraken Elite Fitness</h1>
                        <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Restablecer Contraseña</p>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px;">Hola ${name},</h2>
                        <p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                          Recibimos una solicitud para restablecer la contraseña de tu cuenta en Kraken Elite Fitness.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                          Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace expirará en 1 hora.
                        </p>
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                                Restablecer Contraseña
                              </a>
                            </td>
                          </tr>
                        </table>
                        <!-- Alternative Link -->
                        <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                          Si el botón no funciona, copia y pega este enlace en tu navegador:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #dc2626; font-size: 12px; word-break: break-all;">
                          ${resetUrl}
                        </p>
                        <!-- Warning -->
                        <p style="margin: 30px 0 0 0; color: #ef4444; font-size: 14px; line-height: 1.6; padding: 15px; background-color: rgba(220, 38, 38, 0.1); border-left: 3px solid #dc2626; border-radius: 4px;">
                          <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 30px; text-align: center; background-color: #0a0a0a; border-top: 1px solid #1f1f1f;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                          © ${new Date().getFullYear()} Kraken Elite Fitness. Todos los derechos reservados.
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

