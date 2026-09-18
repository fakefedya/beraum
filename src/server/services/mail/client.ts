import "server-only";
import nodemailer from "nodemailer";
import { serverEnv } from "@/src/lib/env/server";
import { escapeHtml } from "@/src/server/utils/escape";

const createMailTransporter = (
  host: string,
  port: number,
  user: string,
  pass: string,
) => {
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    pool: true,
    maxConnections: 1, // Защита от перегрузки SMTP
    maxMessages: 100,
    auth: { user, pass },
  });
};

const authTransporter = createMailTransporter(
  serverEnv.SMTP_HOST,
  serverEnv.SMTP_PORT,
  serverEnv.SMTP_USER,
  serverEnv.SMTP_PASS,
);

const ordersTransporter = createMailTransporter(
  serverEnv.ORDERS_SMTP_HOST,
  serverEnv.ORDERS_SMTP_PORT,
  serverEnv.ORDERS_SMTP_USER,
  serverEnv.ORDERS_SMTP_PASS,
);

const supportTransporter = createMailTransporter(
  serverEnv.SUPPORT_SMTP_HOST,
  serverEnv.SUPPORT_SMTP_PORT,
  serverEnv.SUPPORT_SMTP_USER,
  serverEnv.SUPPORT_SMTP_PASS,
);

export type OrderMailItem = {
  siteArticle: string;
  uniqueSku: string;
  categoryName: string;
  price: number;
};

// Обертка с жестким таймаутом
async function sendMailWithTimeout(
  transporter: nodemailer.Transporter,
  options: nodemailer.SendMailOptions,
) {
  const sendPromise = transporter.sendMail(options);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("SMTP_TIMEOUT")), 15000),
  );
  await Promise.race([sendPromise, timeoutPromise]);
}

// 1. ОТПРАВКА OTP
export async function sendTwoFactorTokenEmail(email: string, token: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`\n\n🛡️ [SECURITY] 2FA Код для ${email}: ${token}\n\n`);
  }

  try {
    await sendMailWithTimeout(authTransporter, {
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
    });
  } catch (error) {
    console.error("❌ [MAIL] Ошибка отправки 2FA кода:", error);
    throw new Error("Не удалось отправить код на почту");
  }
}

// 2. УВЕДОМЛЕНИЕ КЛИЕНТУ О ЗАКАЗЕ (ДОБАВЛЕНЫ ТОВАРЫ)
export async function sendOrderClientEmail(
  email: string,
  name: string,
  orderNumber: string,
  total: number,
  items: OrderMailItem[],
) {
  const safeName = escapeHtml(name);
  const itemsHtml = items
    .map(
      (item) => `
    <div style="padding: 16px; border: 1px solid #eaeaea; border-radius: 8px; margin-bottom: 12px; background-color: #fafafa;">
      <div style="font-size: 12px; color: #666; text-transform: uppercase;">${escapeHtml(item.categoryName)}</div>
      <div style="font-size: 16px; font-weight: bold; color: #1a1a1a; margin-top: 4px;">${escapeHtml(item.siteArticle)}</div>
      <div style="font-size: 13px; color: #555; margin-top: 4px; font-family: monospace;">Арт.: ${escapeHtml(item.uniqueSku)}</div>
      <div style="font-size: 15px; font-weight: bold; color: #1a1a1a; margin-top: 8px;">${item.price.toLocaleString("ru-RU")} ₽</div>
    </div>
  `,
    )
    .join("");

  try {
    await sendMailWithTimeout(ordersTransporter, {
      from: serverEnv.ORDERS_SMTP_FROM,
      to: email,
      subject: `Beraum: Ваш заказ № ${orderNumber} принят`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Заказ #${escapeHtml(orderNumber)} принят!</h2>
          <p style="color: #333;">Здравствуйте, <strong>${safeName}</strong>!</p>
          <p style="color: #333;">Мы получили ваш заказ. Наш менеджер свяжется с вами в ближайшее время.</p>
          
          <h3 style="color: #1a1a1a; margin-top: 24px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Ваш заказ:</h3>
          ${itemsHtml}
          
          <div style="margin-top: 16px; font-size: 18px; text-align: right;">
            Итого: <strong>${total.toLocaleString("ru-RU")} ₽</strong>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ [MAIL] Ошибка отправки письма клиенту по заказу:", error);
  }
}

// 3. УВЕДОМЛЕНИЯ АДМИНАМ (ОПТИМИЗАЦИЯ ДЛЯ КОПИРОВАНИЯ)
type NotificationPool = "orders" | "support";

export async function sendAdminNotificationEmail(
  pool: NotificationPool,
  subject: string,
  dataParams: Record<string, string | number | undefined>,
) {
  const transporter =
    pool === "orders" ? ordersTransporter : supportTransporter;
  const fromEmail =
    pool === "orders"
      ? serverEnv.ORDERS_SMTP_FROM
      : serverEnv.SUPPORT_SMTP_FROM;
  const toEmail =
    pool === "orders"
      ? serverEnv.ADMIN_ORDERS_EMAIL
      : serverEnv.ADMIN_SUPPORT_EMAIL;

  const rowsHtml = Object.entries(dataParams)
    .filter(([_, value]) => value !== undefined && value !== "")
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #666; vertical-align: top; width: 35%;">
          ${escapeHtml(key)}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee; vertical-align: top;">
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #f4f4f5; padding: 6px 10px; border-radius: 6px; display: inline-block; color: #111; white-space: pre-wrap; word-break: break-word;">${escapeHtml(String(value))}</div>
        </td>
      </tr>
    `,
    )
    .join("");

  try {
    await sendMailWithTimeout(transporter, {
      from: fromEmail,
      to: toEmail,
      subject: `🚨 Уведомление – ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h3 style="color: #1a1a1a; margin-top: 0;">${escapeHtml(subject)}</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px;">
            ${rowsHtml}
          </table>
        </div>
      `,
    });
  } catch (error) {
    console.error(
      `❌ [MAIL] Ошибка отправки уведомления админу (Пул: ${pool}):`,
      error,
    );
  }
}

// 4. УВЕДОМЛЕНИЕ КЛИЕНТУ О ПОЛУЧЕНИИ ЗАЯВКИ (ФОРМЫ)
export async function sendFeedbackClientEmail(
  email: string,
  name: string,
  ticketNumber: string,
  formName: string,
) {
  const safeName = escapeHtml(name);

  try {
    await sendMailWithTimeout(supportTransporter, {
      from: serverEnv.SUPPORT_SMTP_FROM,
      to: email,
      subject: `Уведомление от Beraum: Ваша заявка № ${ticketNumber} получена`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Обращение #${escapeHtml(ticketNumber)}</h2>
          <p style="color: #333;">Здравствуйте, <strong>${safeName}</strong>!</p>
          <p style="color: #333;">Мы успешно получили ваш запрос по теме «${escapeHtml(formName)}».</p>
          <p style="color: #333;">Наш специалист ознакомится с данными и свяжется с вами в ближайшее рабочее время.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px;">Служба поддержки Beraum</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ [MAIL] Ошибка отправки письма клиенту по заявке:", error);
  }
}
