import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/src/server/db/client";
import { marketplaceClicks } from "@/src/server/db/schema";
import { getClientIp, hashIp } from "@/src/server/utils/ip";
import { checkRateLimit } from "@/src/server/utils/rate-limit";
import { VALID_MARKETPLACES } from "@/src/lib/constants/marketplaces";

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
  marketplace: z.enum(VALID_MARKETPLACES),
  article: z.string().min(1).max(50),
  source: z.string().min(1).max(50).default("unknown"), // 🚀 Получаем контекст
});

const isBot = (ua: string) =>
  /bot|crawler|spider|crawling|google|yandex/i.test(ua);

const getDeviceType = (ua: string) => {
  if (!ua) return "unknown";
  return /mobile|android|iphone|ipad|ipod/i.test(ua) ? "mobile" : "desktop";
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();

  const parsed = redirectSchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.redirect(new URL("/", request.url));

  const { url, marketplace, article, source } = parsed.data;
  const userAgent = request.headers.get("user-agent") || "";
  const ip = await getClientIp(request);
  const ipHash = hashIp(ip);

  let deviceId = cookieStore.get("beraum_device_id")?.value;
  let isNewDevice = false;

  if (!deviceId || !z.string().uuid().safeParse(deviceId).success) {
    deviceId = crypto.randomUUID();
    isNewDevice = true;
  }

  const rateLimit = await checkRateLimit("link_click", 10, 60000);

  if (!isBot(userAgent) && rateLimit.success) {
    after(async () => {
      try {
        await db.insert(marketplaceClicks).values({
          article,
          marketplace,
          source,
          deviceType: getDeviceType(userAgent),
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
