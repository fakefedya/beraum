import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { HeroSection } from "./_components/HeroSection";
import { StatisticSection } from "./_components/StatisticSection";
import { DesignSection } from "./_components/DesignSection";
import { QualityControlSection } from "./_components/QualityControlSection";
import { GuaranteeSection } from "./_components/GuaranteeSection";
import { cn } from "@/src/lib/utils";
import { Metadata } from "next";

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "О бренде" },
];

export const metadata: Metadata = {
  title: {
    absolute: "О бренде — Beraum",
  },
  description:
    "Производство надежной кухонной техники без переплат за бренд. Честные процессы, контроль качества на заводах-лидерах индустрии и фокус на интерьерный дизайн.",
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
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
      <StatisticSection />
      <DesignSection />
      <QualityControlSection />
      <GuaranteeSection />
    </div>
  );
}
