import { Metadata } from "next";

import { RetailTab } from "./_components/RetailTab";
import { WholesaleTab } from "./_components/WholesaleTab";
import { DiscountToggle } from "./_components/DiscountToggle";

import { HeroSection } from "./_components/HeroSection";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: "Уцененная и оптовая техника",
  description:
    "Оригинальная техника Beraum со скидками до 50%. Розничные продажи через Ozon и специальные условия для оптовых партнеров.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DiscountPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const mode = resolvedParams.mode === "wholesale" ? "wholesale" : "retail";

  return (
    <div className={cn("flex flex-col gap-10", "md:gap-20")}>
      <HeroSection />
      <div className="sticky top-20 z-40 -mt-8 mb-8 flex w-full justify-center px-4 md:top-24">
        <DiscountToggle currentMode={mode} />
      </div>

      <div className="relative z-20">
        {mode === "retail" ? <RetailTab /> : <WholesaleTab />}
      </div>
    </div>
  );
}
