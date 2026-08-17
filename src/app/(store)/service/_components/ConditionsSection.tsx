import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { COVERAGE_CONDITIONS } from "./data";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

export const ConditionsSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-4">
          <div
            className={cn(
              "bg-background flex flex-col items-center gap-6 rounded-4xl border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
              "lg:p-16",
              "transition-shadow duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
            )}
          >
            <CheckCircle2
              className="text-brand-secondary size-16"
              strokeWidth={1.2}
            />
            <h3 className={cn("text-2xl font-medium", "lg:text-3xl")}>
              Гарантийный случай
            </h3>
            <ul className="flex w-full max-w-sm flex-col gap-4">
              {COVERAGE_CONDITIONS.covered.map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 text-left">
                  <div className="bg-brand-secondary mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span className="text-muted-foreground text-lg leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={cn(
              "bg-card flex flex-col items-center gap-6 rounded-[40px] border border-transparent p-10",
              "lg:p-16",
              "transition-colors duration-500 hover:border-black/5",
            )}
          >
            <XCircle
              className="text-muted-foreground size-16"
              strokeWidth={1.2}
            />
            <h3
              className={cn(
                "text-muted-foreground text-2xl font-medium",
                "lg:text-3xl",
              )}
            >
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
