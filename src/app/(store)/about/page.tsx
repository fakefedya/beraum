import { Metadata } from "next";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { HeroSection } from "./_components/HeroSection";
import { StatisticSection } from "./_components/StatisticSection";
import { DesignSection } from "./_components/DesignSection";
import { QualityControlSection } from "./_components/QualityControlSection";
import { GuaranteeSection } from "./_components/GuaranteeSection";

export const metadata: Metadata = {
  title: "О бренде Beraum | Честная техника для современного интерьера",
  description:
    "Узнайте правду о производстве Beraum. Честный российский бренд, передовые заводы Китая и фокус на интеграции техники в интерьер.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "О бренде" },
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <Container className="pt-32">
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
    </>
  );
}
