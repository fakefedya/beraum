import { Metadata } from "next";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { FaqSection } from "./_components/FaqSection";
import { SupportActionBlock } from "@/src/components/shared/blocks/SupportActionBlock";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: "Вопросы и ответы | Beraum",
  description:
    "Ответы на часто задаваемые вопросы о бытовой технике Beraum, установке, гарантии и возврате.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Вопросы и ответы" },
];

export default function FAQPage() {
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

      <FaqSection />
      <SupportActionBlock />
    </div>
  );
}
