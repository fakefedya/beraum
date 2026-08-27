import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";
import { WholesaleForm } from "./WholesaleForm";
import {
  WHOLESALE_CATEGORIES,
  WHOLESALE_MIN_ORDER,
  WHOLESALE_FAQ,
} from "./data";
import { cn } from "@/src/lib/utils";

export const WholesaleTab = () => {
  return (
    <div className={cn("flex flex-col gap-20", "md:gap-30")}>
      <Section>
        <Container maxWidth="5xl" className="gap-12">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
            <h2 className="text-3xl font-medium md:text-4xl">
              Оптовая продажа техники
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Предлагаем оптовым покупателям исправную уценённую и неисправную
              бытовую технику из текущего складского наличия.
            </p>
            <div className="mt-2 flex flex-col items-center justify-center gap-4 rounded-2xl bg-orange-50 p-4 text-orange-700 md:flex-row md:flex-wrap">
              <span className="font-medium">Минимальный заказ:</span>
              {WHOLESALE_MIN_ORDER.map((order, idx) => (
                <span key={idx} className="text-sm text-orange-700/80">
                  <strong className="mr-1 text-orange-700">
                    {order.label.split(" ")[0]}
                  </strong>
                  {order.value}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {WHOLESALE_CATEGORIES.map((category, idx) => {
              const isBroken = category.title.includes("Неисправная");
              return (
                <article
                  key={idx}
                  className={cn(
                    "bg-card flex flex-col gap-6 rounded-[32px] p-8 md:p-10",
                    isBroken &&
                      "border border-red-500/20 bg-red-50/30 dark:bg-red-950/10",
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <h3
                      className={cn(
                        "text-2xl font-medium",
                        isBroken && "text-red-600 dark:text-red-400",
                      )}
                    >
                      {category.title}
                    </h3>
                    <span className="text-muted-foreground text-sm font-medium">
                      {category.location}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>

                  <div className="mt-4 flex flex-col gap-4">
                    <h4 className="font-medium">Порядок приобретения:</h4>
                    <ol className="text-muted-foreground flex flex-col gap-4">
                      {category.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex gap-4">
                          <span className="bg-background flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium shadow-sm">
                            {stepIdx + 1}
                          </span>
                          <div className="flex flex-col gap-1 pt-1">
                            <span className="text-foreground font-medium">
                              {step.title}
                            </span>
                            <span className="text-sm leading-relaxed">
                              {step.desc}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container maxWidth="4xl" id="wholesale-form">
          <WholesaleForm />
        </Container>
      </Section>

      <Section>
        <Container maxWidth="3xl">
          <h3 className="mb-10 text-center text-3xl font-medium md:text-4xl">
            Вопросы и ответы (Опт)
          </h3>
          <Accordion
            type="multiple"
            className="mx-auto flex w-full flex-col gap-4"
          >
            {WHOLESALE_FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`wholesale-faq-${i}`}
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
