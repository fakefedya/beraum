import { Metadata } from "next";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { HeroSection } from "./_components/HeroSection";
import { OfferSection } from "./_components/OfferSection";
import { PartnershipSection } from "./_components/PartnershipSection";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: "Сотрудничество | Beraum",
  description: "Специальные условия для бизнеса, дизайнеров и девелоперов.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Сотрудничество" },
];

export default function Partnership() {
  return (
    <>
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
    </>
  );
}
