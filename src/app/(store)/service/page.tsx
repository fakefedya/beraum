import { Metadata } from "next";
import { HeroSection } from "./_components/HeroSection";
import { LegalTermsSection } from "./_components/LegalTermsSection";
import { SupportActionBlock } from "@/src/components/shared/blocks/SupportActionBlock";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "Гарантия и сервисное обслуживание — Beraum",
  },
  description:
    "Официальная гарантия на бытовую технику Beraum. Прозрачные условия, собственный склад запчастей в РФ и прямое общение с инженерами без бюрократии.",
  alternates: {
    canonical: "/service",
  },
};

export default function ServicePage() {
  return (
    <div className={cn("flex flex-col gap-20", "md:gap-30")}>
      <HeroSection />
      <LegalTermsSection />
      <SupportActionBlock />
    </div>
  );
}
