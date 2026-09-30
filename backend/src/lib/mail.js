import nodemailer from "nodemailer";

let transporter = null;

export const getTransporter = async () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
    const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

    // If real credentials are provided
    if (user && pass) {
        // If we already have a real authenticated transporter, reuse it
        if (transporter && !transporter.__isTestAccount) {
            return transporter;
        }

        const isGmail = host?.includes("gmail") || user.endsWith("@gmail.com");
        if (isGmail) {
            // Port 465 with SSL is universally allowed on cloud platforms (Render, Railway, etc.)
            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: { user, pass },
                connectionTimeout: 15000,
                greetingTimeout: 15000,
                socketTimeout: 20000,
                tls: {
                    rejectUnauthorized: false,
                },
            });
        } else {
            transporter = nodemailer.createTransport({
                host: host || "smtp.gmail.com",
                port: port,
                secure: process.env.SMTP_SECURE === "true" || port === 465,
                auth: { user, pass },
                connectionTimeout: 15000,
                greetingTimeout: 15000,
                socketTimeout: 20000,
                tls: {
                    rejectUnauthorized: false,
                },
            });
        }
        transporter.__isTestAccount = false;
        return transporter;
    }

    // In production, missing credentials must throw immediately with clear instructions
    if (process.env.NODE_ENV === "production") {
        throw new Error("SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in your deployment environment variables.");
    }

    if (transporter) return transporter;

    // Fallback for local development if SMTP credentials are not yet configured in .env
    try {
        console.warn("[MAIL SERVICE] No SMTP credentials provided in .env. Creating test Ethereal account...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        transporter.__isTestAccount = true;
        return transporter;
    } catch (err) {
        console.error("[MAIL SERVICE] Failed to create test email account:", err.message);
        throw new Error("Unable to initialize email transporter: " + err.message);
    }
};

export async function sendPasswordResetEmail(toEmail, otp) {
    const mailer = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `"hiMEStream" <${process.env.SMTP_USER}>` : '"hiMEStream" <no-reply@himestream.com>');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-height: 100vh; background-color: #0b0f19; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background: #131d2e; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
                        <!-- Brand Header -->
                        <tr>
                            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
                                <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; color: #38bdf8;">hiMEStream</h1>
                                <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">Language Exchange & Video Streaming</p>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 32px;">
                                <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #f1f5f9;">Reset Your Password</h2>
                                <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                                    You requested to reset your password. Use the verification code below to complete the reset process:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(99, 102, 241, 0.12)); border: 1px solid #38bdf8; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; font-weight: 600; margin-bottom: 6px;">Verification Code</div>
                                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff;">${otp}</div>
                                    <div style="font-size: 12px; color: #94a3b8; margin-top: 6px;">Valid for 15 minutes</div>
                                </div>
                                
                                <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                                    If you did not request this password reset, please ignore this email or make sure your account is secure.
                                </p>
                                
                                <div style="border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 24px; font-size: 12px; color: #64748b; text-align: center;">
                                    Never share this verification code with anyone. hiMEStream will never ask for your code.
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const textContent = `hiMEStream Password Reset\n\nYour verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this reset, you can safely ignore this email.`;

    if (!mailer) {
        console.warn(`[MAIL SERVICE] Transporter unavailable. Password reset OTP for ${toEmail} is: ${otp}`);
        return { success: false, error: "No transporter available" };
    }

    try {
        const info = await mailer.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: "Your hiMEStream Password Reset Code",
            text: textContent,
            html: htmlContent,
        });

        console.log(`[MAIL SERVICE] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
        if (mailer.__isTestAccount) {
            console.log(`[MAIL SERVICE] 📩 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[MAIL SERVICE] Failed to send email to ${toEmail}:`, err.message);
        throw err;
    }
}
