import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { STORAGE_URL, SYSTEM_ASSETS } from "@/src/lib/constants/assets";

type ImagePayload =
  string | { bucketName?: string; fileKey?: string } | null | undefined;

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function buildImageUrl(
  payload: ImagePayload,
  defaultBucket: "system-assets" | "products" = "system-assets",
): string {
  if (!payload) return SYSTEM_ASSETS.emptyProduct;

  let path = "";

  if (typeof payload === "string") {
    const cleanPayload = payload.replace(/^\/+/, "");
    if (
      cleanPayload.startsWith("system-assets/") ||
      cleanPayload.startsWith("products/")
    ) {
      path = cleanPayload;
    } else {
      path = `${defaultBucket}/${cleanPayload}`;
    }
  } else {
    if (!payload.fileKey) return SYSTEM_ASSETS.emptyProduct;
    const bucket = payload.bucketName || defaultBucket;
    path = `${bucket}/${payload.fileKey.replace(/^\/+/, "")}`;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${STORAGE_URL}/${path}`;
}
