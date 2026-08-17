import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { PartnershipForm } from "./PartnershipForm";

export const PartnershipSection = () => {
  return (
    <Section>
      <Container maxWidth="2xl">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-5xl font-medium">Давайте работать вместе</h2>
            <p className="text-muted-foreground text-lg">
              У нас есть решения для вашего бизнеса, и мы всегда открыты к
              сотрудничеству и предложениям, — оставьте заявку.
            </p>
          </div>

          <PartnershipForm />
        </div>
      </Container>
    </Section>
  );
};
