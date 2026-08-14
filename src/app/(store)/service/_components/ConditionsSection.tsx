import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { COVERAGE_CONDITIONS } from "./data";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

export const ConditionsSection = () => {
  return (
    <Section className="mt-24">
      <Container maxWidth="5xl" className="flex flex-col gap-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-balance lg:text-5xl">
            Гарантийное покрытие
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-balance lg:text-xl">
            Что входит в бесплатное сервисное обслуживание, а что является зоной
            ответственности пользователя.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
          {/* Блок "Покрывается" */}
          <div className="bg-background flex flex-col items-center rounded-[40px] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] lg:p-14">
            <CheckCircle2
              className="text-brand-secondary mb-8 size-12"
              strokeWidth={1.5}
            />
            <h3 className="mb-10 text-center text-2xl font-medium lg:text-3xl">
              Гарантийный случай
            </h3>
            <ul className="flex w-full max-w-sm flex-col gap-6">
              {COVERAGE_CONDITIONS.covered.map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 text-left">
                  <div className="bg-brand-secondary mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span className="text-foreground/90 text-lg leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Блок "Не покрывается" */}
          <div className="bg-card flex flex-col items-center rounded-[40px] border border-transparent p-10 transition-colors duration-500 hover:border-black/5 lg:p-14">
            <XCircle
              className="text-muted-foreground/50 mb-8 size-12"
              strokeWidth={1.5}
            />
            <h3 className="text-muted-foreground mb-10 text-center text-2xl font-medium lg:text-3xl">
              Не гарантийный случай
            </h3>
            <ul className="flex w-full max-w-sm flex-col gap-6">
              {COVERAGE_CONDITIONS.notCovered.map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 text-left">
                  <div className="bg-muted-foreground/30 mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span className="text-muted-foreground text-lg leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
};
