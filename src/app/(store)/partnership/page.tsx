import { Metadata } from "next";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { PartnershipForm } from "./_components/PartnershipForm";

export const metadata: Metadata = {
  title: "Сотрудничество | Beraum",
  description: "Специальные условия для бизнеса, дизайнеров и девелоперов.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Сотрудничество" },
];

const partners = [
  {
    title: "Девелоперам и рантье",
    description:
      "Комплексное оснащение объектов недвижимости. Подбор техники под бюджет проекта, оптовые цены и гарантийное обслуживание полного цикла.",
  },
  {
    title: "Архитекторам и дизайнерам",
    description:
      "Агентская программа вознаграждений. Предоставление 3D-моделей техники для интеграции в ваши проекты и персональный менеджер.",
  },
  {
    title: "Мебельным салонам",
    description:
      "Интеграция техники Beraum в выставочные образцы кухонь. Специальные условия на покупку экспозиции и дропшиппинг для ваших клиентов.",
  },
  {
    title: "HoReCa",
    description:
      "Оснащение номерного фонда отелей и апартаментов надежной техникой с единым дизайн-кодом и повышенным ресурсом работы.",
  },
];

export default function PartnershipPage() {
  return (
    <>
      <Section>
        <Container className="pt-32 pb-12">
          <Breadcrumbs
            items={breadcrumbItems}
            className="flex justify-center"
          />
        </Container>
      </Section>

      <Section>
        <Container>
          {/* Hero */}
          <div className="mx-auto mb-20 flex max-w-4xl flex-col items-center justify-center gap-6 text-center">
            <h1 className="text-5xl font-medium tracking-tight lg:text-7xl">
              Сотрудничество
            </h1>
            <p className="text-muted-foreground text-lg">
              Мы открыты к долгосрочному партнерству. Beraum предлагает гибкие
              B2B-решения, обеспечивая стабильные поставки, резерв товара и
              прозрачный документооборот.
            </p>
          </div>

          {/* Предложения для аудиторий */}
          <div className="mx-auto mb-24 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-card hover:bg-hover-background flex flex-col gap-3 rounded-[24px] p-8 transition-colors"
              >
                <h3 className="text-2xl font-medium">{partner.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>

          {/* Блок формы обратной связи */}
          <div className="mx-auto mb-32 w-full max-w-2xl">
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
