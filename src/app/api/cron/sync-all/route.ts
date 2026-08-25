import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/src/server/db/client";
import { marketplaceClicks } from "@/src/server/db/schema";
import { checkRateLimit } from "@/src/server/utils/rate-limit";

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
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { url, marketplace, article } = parsed.data;
  const userAgent = request.headers.get("user-agent") || "";

  // 2. Лимитирование (Игнорируем ботов)
  let canTrack = false;
  let ipHashForDb = "";

  if (!isBot(userAgent)) {
    // Разрешаем максимум 20 редиректов в минуту на 1 IP
    const limitRes = await checkRateLimit("go_redirect", 20, 60000);
    canTrack = limitRes.success;
    ipHashForDb = limitRes.ipHash;
  }

  // 3. Идентификация устройства (HttpOnly Cookie)
  let deviceId = cookieStore.get("beraum_device_id")?.value;
  let isNewDevice = false;

  if (!deviceId || !z.string().uuid().safeParse(deviceId).success) {
    deviceId = crypto.randomUUID();
    isNewDevice = true;
  }

  // 4. Запись в аналитику через next/server `after`
  if (canTrack) {
    after(async () => {
      try {
        await db.insert(marketplaceClicks).values({
          article,
          marketplace,
          deviceId: deviceId!, // Гарантированно UUID
          userAgent: userAgent.substring(0, 255), // Защита от переполнения поля в БД
          ipHash: ipHashForDb,
        });
      } catch (error) {
        console.error("❌ [DB] Ошибка фоновой записи клика:", error);
      }
    });
  }

  // 5. Модификация URL и Редирект
  const targetUrl = new URL(url);

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
