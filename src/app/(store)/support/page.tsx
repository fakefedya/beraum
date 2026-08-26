import { Container } from "@/src/components/shared/Container";
import { HeroSection } from "./_components/HeroSection";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Metadata } from "next";
import { SupportSection } from "./_components/SupportSection";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "Служба технической поддержки — Beraum",
  },
  description:
    "Прямая связь с инженерами Beraum. Помощь с эксплуатацией, оформление гарантийных обращений и профессиональные консультации по бытовой технике.",
  alternates: {
    canonical: "/support",
  },
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Поддержка" },
];

export default function Support() {
  return (
    <div className={cn("flex flex-col gap-20", "md:gap-30")}>
      <Section>
        <Container className={cn("pt-24", "md:pt-32")}>
          <Breadcrumbs
            items={breadcrumbItems}
            className="flex justify-center"
          />
        </Container>
      </Section>

      <HeroSection />
      <SupportSection />
    </div>
  );
}
