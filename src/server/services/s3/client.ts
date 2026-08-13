import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { serverEnv } from "@/src/lib/env/server";

export const s3Client = new S3Client({
  region: "eu-west-1", // Формальность для SDK
  endpoint: `http://${serverEnv.MINIO_ENDPOINT}:${serverEnv.MINIO_PORT}`,
  credentials: {
    accessKeyId: serverEnv.MINIO_ACCESS_KEY,
    secretAccessKey: serverEnv.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // КРИТИЧНО ДЛЯ MINIO
});
