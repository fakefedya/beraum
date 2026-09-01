import "server-only";
import nodemailer from "nodemailer";
import { serverEnv } from "@/src/lib/env/server";

const transporter = nodemailer.createTransport({
  host: serverEnv.SMTP_HOST,
  port: serverEnv.SMTP_PORT,
  secure: serverEnv.SMTP_PORT === 465,
  pool: true,
  maxConnections: 1,
  maxMessages: 100,
  auth: {
    user: serverEnv.SMTP_USER,
    pass: serverEnv.SMTP_PASS,
  },
});

export async function sendTwoFactorTokenEmail(email: string, token: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`\n\n🛡️ [SECURITY] 2FA Код для ${email}: ${token}\n\n`);
  }

  try {
    const mailOptions = {
      from: serverEnv.SMTP_FROM,
      to: email,
      subject: "Безопасность Beraum: Код подтверждения (2FA)",
      text: `Ваш код для входа в панель управления: ${token}. Код действителен 5 минут.`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Вход в систему</h2>
          <p style="color: #555; font-size: 15px;">Ваш одноразовый код подтверждения:</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111;">
            ${token}
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 24px; line-height: 1.5;">
            Код действителен 5 минут. Если вы не запрашивали этот код, проигнорируйте письмо.
          </p>
        </div>
      `,
    };

    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP_TIMEOUT")), 15000),
    );

    await Promise.race([sendPromise, timeoutPromise]);
  } catch (error) {
    console.error("❌ [MAIL] Ошибка отправки 2FA кода:", error);
    throw new Error("Не удалось отправить код на почту");
  }
}
