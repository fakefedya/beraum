import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { SupportForm } from "./SupportForm";
import { getCategoriesList } from "@/src/server/actions/categories.queries";

export const SupportSection = async () => {
  const { data: categories } = await getCategoriesList();

  return (
    <Section>
      <Container maxWidth="2xl" className="mb-32">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-5xl font-medium">Служба поддержки</h2>
            <p className="text-muted-foreground text-lg">
              Опишите вашу проблему, и наши специалисты свяжутся с вами для ее
              оперативного решения.
            </p>
          </div>

          <SupportForm categories={categories || []} />
        </div>
      </Container>
    </Section>
  );
};
