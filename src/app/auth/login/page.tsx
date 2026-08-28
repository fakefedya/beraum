import { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";
import { Icons } from "@/src/components/ui/icons";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { buildImageUrl, cn } from "@/src/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Вход в систему — Beraum",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start gap-8 p-4 md:gap-0">
      {/* <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="bg-brand/5 absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-blue-500/5 blur-[120px]" />
      </div> */}

      <div className="flex w-full items-center justify-between p-0 md:p-12">
        <Icons.logo className="fill-foreground stroke-current stroke-[0.25] [shape-rendering:crispEdges]" />
        <Link
          href={"/"}
          className={cn(
            "bg-card flex items-center gap-2 rounded-2xl px-4 py-2 font-medium",
            "hover:bg-card/80 transition-colors duration-300",
          )}
        >
          <div className="relative h-5 w-5">
            <SafeImage
              src={buildImageUrl("pages/auth/basket-icon.png")}
              alt={"Иконка корзинки"}
              className="shrink-0"
              fill
            />
          </div>
          Вернуться на сайт
        </Link>
      </div>
      <div className="relative z-10 w-full max-w-md flex-col gap-12">
        <LoginForm />
        <div className="bg-card flex gap-4 rounded-xl px-4 pt-4">
          <div className="relative block h-36 w-38.5 shrink-0">
            <SafeImage
              src={buildImageUrl("pages/auth/homescreen-app.png")}
              alt={"Иконка корзинки"}
              className="object-cover"
              fill
            />
          </div>
          <div className="h-fill flex w-full flex-col justify-center gap-2 pb-4">
            <h2 className="text-xl font-semibold">Быстрый доступ</h2>
            <p className="text-muted-foreground">
              Добавляйте на рабочий стол Android или IPhone ссылку на ЛК Beraum
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
