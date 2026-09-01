import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UsersTableWrapper } from "./_components/UsersTableWrapper";
import { CreateUserSheet } from "./_components/CreateUserSheet";
import { requireAuthRole } from "@/src/server/utils/auth-check";
import { z } from "zod";

export const metadata: Metadata = {
  title: "Настройки и Пользователи — Beraum Admin",
};

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
});

export default async function SettingsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let userContext;
  try {
    userContext = await requireAuthRole(["superadmin"]);
  } catch {
    redirect("/dashboard");
  }

  const rawParams = await props.searchParams;
  const { page } = searchParamsSchema.parse(rawParams);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Пользователи</h1>
        <CreateUserSheet />
      </div>

      <Suspense
        key={`users-page-${page}`}
        fallback={
          <div className="bg-card flex h-64 w-full items-center justify-center rounded-xl border">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <UsersTableWrapper page={page} currentUserId={userContext.userId} />
      </Suspense>
    </div>
  );
}
