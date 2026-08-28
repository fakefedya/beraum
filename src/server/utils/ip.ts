import "server-only";
import crypto from "crypto";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { serverEnv } from "@/src/lib/env/server";

export async function getClientIp(req?: NextRequest): Promise<string> {
  const headersList = req ? req.headers : await headers();

  const cfIp = headersList.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "127.0.0.1";
}

export function hashIp(ip: string): string {
  return crypto
    .createHmac("sha256", serverEnv.IP_HASH_SALT)
    .update(ip)
    .digest("hex");
}
