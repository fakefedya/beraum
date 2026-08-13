import { Container } from "@/src/components/shared/Container";
import { HeroSection } from "./_components/HeroSection";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Metadata } from "next";
import { SupportSection } from "./_components/SupportSection";

export const metadata: Metadata = {
  title: "Сотрудничество | Beraum",
  description: "Специальные условия для бизнеса, дизайнеров и девелоперов.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Поддержка" },
];

export default function Support() {
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
      <SupportSection />
    </>
  );
}
