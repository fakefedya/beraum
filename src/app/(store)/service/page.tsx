import { Metadata } from "next";
import { HeroSection } from "./_components/HeroSection";
import { LegalTermsSection } from "./_components/LegalTermsSection";
import { SupportActionBlock } from "@/src/components/shared/blocks/SupportActionBlock";

export const metadata: Metadata = {
  title: "Гарантия | Beraum",
  description:
    "Официальная гарантия на всю бытовую технику Beraum. Условия обслуживания и поддержка клиентов.",
};

export default function ServicePage() {
  return (
    <>
      <HeroSection />
      <LegalTermsSection />
      <SupportActionBlock />
    </>
  );
}
