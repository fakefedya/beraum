import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { SupportForm } from "./SupportForm";
import { getCategoriesList } from "@/src/server/queries/categories";

export const SupportSection = async () => {
  const { data: categories } = await getCategoriesList();

  return (
    <Section>
      <Container maxWidth="3xl">
        <SupportForm categories={categories || []} />
      </Container>
    </Section>
  );
};
