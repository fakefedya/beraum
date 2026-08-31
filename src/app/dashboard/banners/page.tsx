import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BannersTableWrapper } from "./_components/BannersTableWrapper";
import { BannerSheet } from "./_components/BannerSheet";
import { requireAuthRole } from "@/src/server/utils/auth-check";

export const metadata: Metadata = {
  title: "Управление баннерами — Beraum Admin",
};

export default async function AdminBannersPage() {
  try {
    await requireAuthRole(["superadmin", "manager"]);
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Баннеры</h1>
        <BannerSheet />
      </div>

      <Suspense
        fallback={
          <div className="bg-card flex h-64 w-full items-center justify-center rounded-xl border">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        }
      >
        <BannersTableWrapper />
      </Suspense>
    </div>
  );
}
