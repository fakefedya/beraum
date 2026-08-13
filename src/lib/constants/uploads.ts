export const SUPPORT_MEDIA_CONFIG = {
  MAX_FILES: 5,
  MAX_SIZE_MB: 50,

  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "video/mp4",
    "application/pdf",
  ],

  ALLOWED_EXTENSIONS: [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
    ".mp4",
    ".pdf",
  ],
} as const;
