import { Metadata } from "next";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { HeroSection } from "./_components/HeroSection";
import { ConditionsSection } from "./_components/ConditionsSection";
import { LegalTermsSection } from "./_components/LegalTermsSection";
import { ActionSection } from "./_components/ActionSection";

export const metadata: Metadata = {
  title: "Гарантия | Beraum",
  description:
    "Официальная гарантия на всю бытовую технику Beraum. Условия обслуживания и поддержка клиентов.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Гарантия" },
];

export default function ServicePage() {
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
      <ConditionsSection />
      <LegalTermsSection />
      <ActionSection />
    </>
  );
}
