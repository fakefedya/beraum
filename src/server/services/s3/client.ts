import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { serverEnv } from "@/src/lib/env/server";

const credentials = {
  accessKeyId: serverEnv.MINIO_ACCESS_KEY,
  secretAccessKey: serverEnv.MINIO_SECRET_KEY,
};

// Для операций сервер -> MinIO (удаление, проверка файлов)
export const s3Internal = new S3Client({
  region: "eu-west-1",
  endpoint: serverEnv.S3_INTERNAL_URL,
  credentials,
  forcePathStyle: true,
});

// ТОЛЬКО для генерации presigned-ссылок, отдаваемых браузеру
export const s3Public = new S3Client({
  region: "eu-west-1",
  endpoint: serverEnv.S3_PUBLIC_URL,
  credentials,
  forcePathStyle: true,
});
