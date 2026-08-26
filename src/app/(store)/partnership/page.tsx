import { Metadata } from "next";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { HeroSection } from "./_components/HeroSection";
import { OfferSection } from "./_components/OfferSection";
import { PartnershipSection } from "./_components/PartnershipSection";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "Сотрудничество — Beraum для бизнеса и дизайнеров",
  },
  description:
    "Специальные условия для девелоперов, архитекторов, мебельных салонов и HoReCa. Оптовые цены, 3D-модели техники и персональный менеджер.",
  alternates: {
    canonical: "/partnership",
  },
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Сотрудничество" },
];

export default function Partnership() {
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
      <OfferSection />
      <PartnershipSection />
    </div>
  );
}
