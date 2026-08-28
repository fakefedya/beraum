import { Metadata } from "next";
import { auth } from "@/src/lib/auth/auth";
import { redirect } from "next/navigation";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { desc } from "drizzle-orm";
import { UsersTable } from "./_components/UsersTable";
import { CreateUserSheet } from "./_components/CreateUserSheet";

export const metadata: Metadata = {
  title: "Настройки и Пользователи — Beraum Admin",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    redirect("/dashboard");
  }

  const usersList = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Сотрудники</h1>
        <CreateUserSheet />
      </div>

      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <UsersTable initialData={usersList} currentUserId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
