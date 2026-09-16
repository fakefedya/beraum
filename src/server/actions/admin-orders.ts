"use server";

import { z } from "zod";
import { db } from "@/src/server/db/client";
import { orders } from "@/src/server/db/schema/orders.schema";
import { discountItems } from "@/src/server/db/schema/discount.schema";
import { requireAuthRole } from "@/src/server/utils/auth-check";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";

export async function updateOrderStatusAction(formData: FormData) {
  try {
    await requireAuthRole(["superadmin", "admin", "manager"]);

    const orderId = formData.get("orderId") as string;
    const newStatus = formData.get("status") as
      "new" | "processing" | "completed" | "cancelled";

    if (!z.string().uuid().safeParse(orderId).success)
      return { success: false, error: "INVALID_ID" };

    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .for("update");
      if (!order) throw new Error("Заказ не найден");

      const skus = order.items.map((i) => i.uniqueSku);

      // Логика синхронизации склада дисконта
      if (newStatus === "completed" && order.status !== "completed") {
        await tx
          .update(discountItems)
          .set({ status: "sold", updatedAt: new Date() })
          .where(inArray(discountItems.uniqueSku, skus));
      } else if (newStatus === "cancelled" && order.status !== "cancelled") {
        await tx
          .update(discountItems)
          .set({ status: "available", reservedAt: null, updatedAt: new Date() })
          .where(inArray(discountItems.uniqueSku, skus));
      }

      await tx
        .update(orders)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/discount-products");
    revalidatePath("/discount");

    return { success: true };
  } catch (error: unknown) {
    console.error("❌ [updateOrderStatusAction]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Внутренняя ошибка базы данных",
    };
  }
}
