import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/src/server/db/client";
import { marketplaceClicks } from "@/src/server/db/schema";
import { getClientIp, hashIp } from "@/src/server/utils/ip";
import { VALID_MARKETPLACES } from "@/src/lib/constants/marketplaces";

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
  // 🚀 ПАТЧ: Синхронизированный массив без зависимостей
  marketplace: z.enum(VALID_MARKETPLACES),
  article: z.string().min(1).max(50),
});

const isBot = (userAgent: string) => {
  return /bot|crawler|spider|crawling|google|yandex|bing|slurp|duckduckgo|baiduspider/i.test(
    userAgent,
  );
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ipHash);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();

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

  const ip = await getClientIp(request);
  const ipHash = hashIp(ip);

  let deviceId = cookieStore.get("beraum_device_id")?.value;
  let isNewDevice = false;

  if (!deviceId || !z.string().uuid().safeParse(deviceId).success) {
    deviceId = crypto.randomUUID();
    isNewDevice = true;
  }

  if (!isBot(userAgent) && checkRateLimit(ipHash)) {
    after(async () => {
      try {
        await db.insert(marketplaceClicks).values({
          article,
          marketplace,
          deviceId: deviceId!,
          userAgent: userAgent.substring(0, 255),
          ipHash,
        });
      } catch (error) {
        console.error("❌ [DB] Ошибка фоновой записи клика:", error);
      }
    });
  }

  const targetUrl = new URL(url);

  if (!targetUrl.searchParams.has("utm_source")) {
    targetUrl.searchParams.set("utm_source", "beraum_showcase");
    targetUrl.searchParams.set("utm_medium", "referral");
  }

  const response = NextResponse.redirect(targetUrl, 302);

  if (isNewDevice) {
    response.cookies.set("beraum_device_id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
