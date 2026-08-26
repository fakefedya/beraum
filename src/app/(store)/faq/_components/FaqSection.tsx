import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { FAQ_DATA } from "./data";
import { cn } from "@/src/lib/utils";

export const FaqSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div
          className={cn(
            "bg-card flex flex-col gap-10 rounded-4xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
            "md:p-10",
            "lg:gap-16 lg:p-16",
          )}
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-8 text-center">
            <h1
              className={cn(
                "text-foreground text-4xl font-semibold text-balance",
                "md:text-5xl lg:text-6xl",
              )}
            >
              Вопросы и ответы
            </h1>
            <p
              className={cn(
                "text-muted-foreground text-base leading-relaxed text-pretty",
                "md:text-lg",
              )}
            >
              Собрали для вас ответы на самые популярные вопросы о нашей
              технике, доставке и сервисном обслуживании.
            </p>
          </div>

          <Accordion
            type="multiple"
            className="mx-auto flex w-full max-w-4xl flex-col gap-4"
          >
            {FAQ_DATA.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-b border-black/10 pb-2 last:border-0"
              >
                <AccordionTrigger
                  className={cn(
                    "text-left text-xl font-medium hover:no-underline lg:text-2xl",
                    "hover:text-brand-secondary py-6 transition-colors duration-300",
                  )}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground flex flex-col gap-4 pr-8 pb-8 text-base leading-relaxed lg:text-lg">
                  {item.answerBlocks.map((block, bIdx) => (
                    <div key={bIdx} className="flex flex-col gap-2">
                      {block.heading && (
                        <h4 className="text-foreground mt-2 font-medium">
                          {block.heading}
                        </h4>
                      )}
                      <p>{block.text}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
};
