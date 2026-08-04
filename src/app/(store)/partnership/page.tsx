import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beraum",
  description: "Какое-то описание",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Сотрудничество", href: "/partnership" },
];

export default function Partnership() {
  return (
    <Section>
      <Container className="pt-32">
        <Breadcrumbs items={breadcrumbItems} className="flex justify-center" />
      </Container>
    </Section>
  );
}
