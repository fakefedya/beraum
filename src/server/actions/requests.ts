"use server";

import { auth } from "@/src/lib/auth/auth";
import { db } from "@/src/server/db/client";
import { feedbackRequests } from "@/src/server/db/schema/feedback.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Public } from "../services/s3/client";

const REQUEST_MEDIA_KEY_REGEX =
  /^requests\/\d{4}-\d{2}-\d{2}\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-z0-9]+$/;

async function requireSupportOrAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  if (
    session.user.isLocked ||
    !["superadmin", "support"].includes(session.user.role)
  ) {
    throw new Error("FORBIDDEN");
  }
  return session.user.id;
}

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "in_progress", "resolved"]),
});

export async function updateRequestStatus(formData: FormData) {
  try {
    await requireSupportOrAdmin();

    const rawId = formData.get("id");
    const rawStatus = formData.get("status");

    const parsed = updateStatusSchema.safeParse({
      id: rawId,
      status: rawStatus,
    });
    if (!parsed.success) return { success: false, error: "INVALID_DATA" };

    const { id, status } = parsed.data;

    await db
      .update(feedbackRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedbackRequests.id, id));

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: "DB_ERROR" };
  }
}

export async function getMediaUrlsAction(keys: string[]) {
  await requireSupportOrAdmin();
  if (!keys || keys.length === 0) return [];

  try {
    const urls = await Promise.all(
      keys.map(async (key) => {
        if (!REQUEST_MEDIA_KEY_REGEX.test(key)) {
          throw new Error("INVALID_KEY_FORMAT");
        }

        const command = new GetObjectCommand({
          Bucket: "support-media",
          Key: key,
        });

        const url = await getSignedUrl(s3Public, command, { expiresIn: 3600 });
        return { key, url };
      }),
    );

    return urls;
  } catch (error) {
    return [];
  }
}
