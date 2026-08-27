import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Дашборд — Beraum",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Сводка</h1>
      <div className="bg-card rounded-2xl border p-6">
        <p className="text-muted-foreground">
          Добро пожаловать в панель управления Beraum.
        </p>
      </div>
    </div>
  );
}
