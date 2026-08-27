import "server-only";
import crypto from "crypto";

export function generateTicketNumber(): string {
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `BRM-${randomHex}`;
}
