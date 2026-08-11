import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { PartnershipForm } from "./PartnershipForm";

export const PartnershipSection = () => {
  return (
    <Section>
      <Container maxWidth="2xl" className="mb-32">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-3xl font-medium">Давайте работать вместе</h2>
            <p className="text-muted-foreground">
              У нас есть решения для вашего бизнеса, и мы всегда открыты к
              сотрудничеству и предложениям, — оставьте заявку через формой
              обратной связи.
            </p>
          </div>

          <PartnershipForm />
        </div>
      </Container>
    </Section>
  );
};
