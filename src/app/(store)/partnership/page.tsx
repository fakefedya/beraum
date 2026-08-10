import { Metadata } from "next";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { PartnershipForm } from "./_components/PartnershipForm";
import { HeroSection } from "./_components/HeroSection";
import { PartnersSection } from "./_components/PartnersSection";

export const metadata: Metadata = {
  title: "Сотрудничество | Beraum",
  description: "Специальные условия для бизнеса, дизайнеров и девелоперов.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Сотрудничество" },
];

export default function PartnershipPage() {
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
      <PartnersSection />

      <Section>
        <Container>
          {/* Предложения для аудиторий */}
          <div className="mx-auto mb-24 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
            {/* {partners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-card hover:bg-hover-background flex flex-col gap-3 rounded-[24px] p-8 transition-colors"
              >
                <h3 className="text-2xl font-medium">{partner.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {partner.description}
                </p>
              </div>
            ))} */}
          </div>

          {/* Блок формы обратной связи */}
          <div id="link" className="mx-auto mb-32 w-full max-w-2xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-3xl font-medium">Стать партнером</h2>
              <p className="text-muted-foreground">
                Оставьте заявку, и наш B2B-менеджер свяжется с вами в течение
                рабочего дня для обсуждения индивидуальных условий.
              </p>
            </div>
            {/* Изолированный клиентский компонент формы */}
            <PartnershipForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
