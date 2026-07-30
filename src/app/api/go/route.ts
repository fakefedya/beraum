import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/src/server/db/client";
import { marketplaceClicks } from "@/src/server/db/schema";

// --- SECURITY: Строгий Whitelist доменов (Защита от Open Redirect) ---
const ALLOWED_DOMAINS = [
  "ozon.ru",
  "wildberries.ru",
  "market.yandex.ru",
  "mvideo.ru",
];

const redirectSchema = z.object({
  url: z
    .string()
    .url()
    .refine((val) => {
      try {
        const hostname = new URL(val).hostname;
        return ALLOWED_DOMAINS.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
        );
      } catch {
        return false;
      }
    }, "Недопустимый домен"),
  marketplace: z.enum(["ozon", "wb", "ymarket", "mvideo"]),
  article: z.string().min(1).max(50),
});

// --- ЭВРИСТИКА: Простая защита от парсеров ---
const isBot = (userAgent: string) => {
  return /bot|crawler|spider|crawling|google|yandex|bing|slurp|duckduckgo|baiduspider/i.test(
    userAgent,
  );
};

// --- SECURITY: In-Memory Rate Limiter ---
// Защищает PostgreSQL от спам-атак (DDoS прикладного уровня)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 минута
const MAX_REQUESTS_PER_WINDOW = 20; // Максимум 20 редиректов в минуту с одного IP

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ipHash);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Лимит превышен
  }

  record.count += 1;
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();

  // 1. Валидация входных параметров
  const parsed = redirectSchema.safeParse({
    url: searchParams.get("url"),
    marketplace: searchParams.get("marketplace"),
    article: searchParams.get("article"),
  });

  if (!parsed.success) {
    console.warn(
      "⚠️ [SECURITY] Попытка эксплуатации Open Redirect или невалидные параметры:",
      searchParams.toString(),
    );
    // Тихо возвращаем на главную без раскрытия деталей ошибки
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { url, marketplace, article } = parsed.data;
  const userAgent = request.headers.get("user-agent") || "";

  // 2. Безопасное извлечение IP (с учетом прокси/Docker)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  // Если есть цепочка прокси, берем первый IP (клиентский)
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : realIp || "127.0.0.1";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  // 3. Идентификация устройства (HttpOnly Cookie)
  let deviceId = cookieStore.get("beraum_device_id")?.value;
  let isNewDevice = false;

  if (!deviceId || !z.string().uuid().safeParse(deviceId).success) {
    deviceId = crypto.randomUUID();
    isNewDevice = true;
  }

  // 4. Запись в аналитику (Асинхронно, если не бот и не превышен лимит)
  if (!isBot(userAgent) && checkRateLimit(ipHash)) {
    // next/server `after` позволяет не блокировать Response для клиента
    after(async () => {
      try {
        await db.insert(marketplaceClicks).values({
          article,
          marketplace,
          deviceId: deviceId!, // Гарантированно UUID
          userAgent: userAgent.substring(0, 255), // Защита от переполнения поля в БД
          ipHash,
        });
      } catch (error) {
        console.error("❌ [DB] Ошибка фоновой записи клика:", error);
      }
    });
  }

  // 5. Модификация URL и Редирект
  const targetUrl = new URL(url);

  // Добавляем UTM-метки витрины для сквозной аналитики на маркетплейсах
  if (!targetUrl.searchParams.has("utm_source")) {
    targetUrl.searchParams.set("utm_source", "beraum_showcase");
    targetUrl.searchParams.set("utm_medium", "referral");
  }

  // Используем 302 (Found) вместо 301, чтобы браузер не кэшировал переход
  const response = NextResponse.redirect(targetUrl, 302);

  // 6. Установка защищенной куки для новых пользователей
  if (isNewDevice) {
    response.cookies.set("beraum_device_id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Только HTTPS в проде
      sameSite: "strict", // Защита от CSRF
      maxAge: 60 * 60 * 24 * 365, // 1 год
    });
  }

  return response;
}
