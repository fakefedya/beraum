import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { LEGAL_TERMS } from "./data";
import { cn } from "@/src/lib/utils";

export const LegalTermsSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl" className="gap-12">
        <h2
          className={cn(
            "text-center text-3xl font-medium",
            "md:text-4xl",
            "lg:text-5xl",
          )}
        >
          Юридическая прозрачность
        </h2>

        <div className={cn("grid w-full grid-cols-1 gap-4", "md:grid-cols-2")}>
          {LEGAL_TERMS.map((section, idx) => (
            <article
              key={idx}
              className={cn(
                "bg-card flex flex-col gap-8 rounded-[40px] border-2 border-transparent p-6",
                "transition-colors duration-500 hover:border-black/5",
                "md:p-10",
                "lg:p-16",
              )}
            >
              <h3
                className={cn(
                  "text-center text-2xl font-medium",
                  "lg:text-3xl",
                )}
              >
                {section.title}
              </h3>
              <ul className="flex flex-col gap-6">
                {section.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-4 text-left"
                  >
                    <span className="text-brand-secondary mt-0.5 shrink-0 font-medium">
                      &mdash;
                    </span>
                    <span className="text-muted-foreground leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
};
