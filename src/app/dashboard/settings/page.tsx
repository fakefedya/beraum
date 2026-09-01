import { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { desc } from "drizzle-orm";
import { UsersTable } from "./_components/UsersTable";
import { CreateUserSheet } from "./_components/CreateUserSheet";
import { requireAuthRole } from "@/src/server/utils/auth-check";

export const metadata: Metadata = {
  title: "Настройки и Пользователи — Beraum Admin",
};

export default async function SettingsPage() {
  let userContext;
  try {
    userContext = await requireAuthRole(["superadmin"]);
  } catch {
    redirect("/dashboard");
  }

  const usersList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isLocked: users.isLocked,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Пользователи</h1>
        <CreateUserSheet />
      </div>

      <div className="bg-muted overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <UsersTable
            initialData={usersList}
            currentUserId={userContext.userId}
          />
        </div>
      </div>
    </div>
  );
}
