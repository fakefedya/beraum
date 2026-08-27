import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { RETAIL_INFO, RETAIL_FAQ } from "./data";
import { cn } from "@/src/lib/utils";

export const RetailTab = () => {
  return (
    <div className={cn("flex flex-col gap-20", "md:gap-30")}>
      <Section>
        <Container maxWidth="5xl" className="gap-12">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="flex flex-col items-center gap-6 md:items-start">
              <h2 className="text-center text-3xl font-medium md:text-left md:text-4xl">
                Качество без компромиссов. <br className="hidden md:block" />
                Выгода до 50%.
              </h2>
              <p className="text-muted-foreground text-center leading-relaxed md:text-left md:text-lg">
                {RETAIL_INFO.description}
              </p>

              <Button
                asChild
                className={cn(
                  "bg-brand text-foreground hover:bg-brand/90 mt-4 h-12 w-fit rounded-[16px] px-8 text-base font-medium",
                  "shadow-button transition-all duration-300",
                )}
              >
                <a
                  href="https://ozon.ru/t/wEfsAwP"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Перейти в каталог Ozon
                  <ExternalLink className="ml-2 size-4" strokeWidth={2.5} />
                </a>
              </Button>
            </div>

            {/* Инфо-карточка с причинами уценки */}
            <article className="bg-card flex flex-col gap-6 rounded-[32px] p-8 md:p-10">
              <h3 className="text-xl font-medium">Возможные причины уценки:</h3>
              <ul className="text-muted-foreground flex flex-col gap-3">
                {RETAIL_INFO.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-secondary mt-0.5 size-5 shrink-0" />
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
              <p className="bg-background/50 mt-2 rounded-xl p-4 text-sm leading-relaxed font-medium">
                {RETAIL_INFO.benefits}
              </p>
            </article>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container maxWidth="3xl">
          <h3 className="mb-10 text-center text-3xl font-medium md:text-4xl">
            Частые вопросы
          </h3>
          <Accordion
            type="multiple"
            className="mx-auto flex w-full flex-col gap-4"
          >
            {RETAIL_FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`retail-faq-${i}`}
                className="border-b border-black/10 pb-2 last:border-0"
              >
                <AccordionTrigger
                  className={cn(
                    "hover:text-brand-secondary py-6 text-left text-xl font-medium transition-colors duration-300 hover:no-underline lg:text-2xl",
                  )}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pr-8 pb-8 text-base leading-relaxed lg:text-lg">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>
    </div>
  );
};
