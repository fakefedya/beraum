import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { PartnershipForm } from "./PartnershipForm";
import { cn } from "@/src/lib/utils";

export const PartnershipSection = () => {
  return (
    <Section>
      <Container maxWidth="2xl">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4 text-center">
            <h2
              className={cn(
                "text-center text-3xl font-medium",
                "md:text-4xl",
                "lg:text-5xl",
              )}
            >
              Давайте работать вместе
            </h2>
            <p
              className={cn(
                "text-muted-foreground text-base leading-relaxed text-pretty",
                "md:text-lg",
              )}
            >
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
