import "server-only";
import crypto from "crypto";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { serverEnv } from "@/src/lib/env/server";

export async function getClientIp(req?: NextRequest): Promise<string> {
  const forwardedFor = req
    ? req.headers.get("x-forwarded-for")
    : (await headers()).get("x-forwarded-for");
  const realIp = req
    ? req.headers.get("x-real-ip")
    : (await headers()).get("x-real-ip");

  if (realIp) return realIp;
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[ips.length - 1].trim();
  }
  return "127.0.0.1";
}

export function hashIp(ip: string): string {
  return crypto
    .createHmac("sha256", serverEnv.IP_HASH_SALT)
    .update(ip)
    .digest("hex");
}
