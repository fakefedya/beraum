import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { LEGAL_TERMS } from "./data";
import { ShieldAlert } from "lucide-react";

export const LegalTermsSection = () => {
  return (
    <Section className="mt-32">
      <Container
        maxWidth="5xl"
        className="flex flex-col items-center gap-16 lg:gap-24"
      >
        {/* Заголовок секции */}
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="bg-background mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 shadow-sm">
            <ShieldAlert className="text-foreground size-8" strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-medium tracking-tight text-balance lg:text-5xl">
            Юридическая прозрачность
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-balance lg:text-xl">
            Полный регламент гарантийного обслуживания, составленный в
            соответствии с законом РФ «О защите прав потребителей».
          </p>
        </div>

        {/* 2x2 Grid Карточек */}
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
          {LEGAL_TERMS.map((section, idx) => (
            <article
              key={idx}
              className="bg-card flex flex-col gap-8 rounded-[40px] border-2 border-transparent p-10 transition-colors duration-500 hover:border-black/5 lg:p-12"
            >
              <h3 className="text-center text-2xl font-medium tracking-tight">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-5">
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
