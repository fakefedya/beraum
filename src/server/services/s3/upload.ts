import "server-only";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3Public } from "./client";

interface PresignedUrlOptions {
  bucket: string;
  fileKey: string;
  contentType: string;
  fileSize: number;
  expires?: number;
}

export async function generatePresignedUrl({
  bucket,
  fileKey,
  contentType,
  fileSize,
  expires = 300,
}: PresignedUrlOptions) {
  const { url, fields } = await createPresignedPost(s3Public, {
    Bucket: bucket,
    Key: fileKey,
    Conditions: [
      ["content-length-range", 1, fileSize],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: { "Content-Type": contentType },
    Expires: expires,
  });

  return { url, fields, fileKey };
}
