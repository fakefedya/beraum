import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

export const GuaranteeSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl" className="gap-12">
        <div
          className={cn(
            "bg-foreground text-background mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-12 p-10 duration-500 lg:flex-row lg:p-16",
            "relative overflow-hidden rounded-l-4xl rounded-r-4xl",
            "before:bg-background before:absolute before:-top-3 before:left-[10%] before:h-6 before:w-6 before:-translate-x-1/2 before:rounded-full before:content-['']",
            "after:bg-background after:absolute after:-bottom-3 after:left-[10%] after:h-6 after:w-6 after:-translate-x-1/2 after:rounded-full after:content-['']",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-6 text-center",
              "lg:w-2/3 lg:text-left",
            )}
          >
            <h2 className={cn("text-3xl font-medium", "lg:text-4xl")}>
              Поддержка без бюрократии
            </h2>
            <div className="text-background/80 flex flex-col gap-2 text-lg leading-relaxed">
              <p>
                Прямые продажи означают прямую ответственность. У нас нет
                сложной цепи дистрибьюторов, перекидывающих вину друг на друга.
              </p>
              <p>
                На технику действует официальная гарантия от 1 года (в
                зависимости от категории).
              </p>
              <p>
                Собственный сервисный центр и склад запчастей в РФ позволяют
                решать вопросы напрямую и в кратчайшие сроки.
              </p>
            </div>

            <div
              className={cn(
                "mt-2 flex flex-wrap justify-center gap-4",
                "lg:justify-start",
              )}
            >
              <Button
                asChild
                variant="outline"
                className={cn(
                  "text-background border-background/20 h-12 rounded-[16px] bg-transparent px-4",
                  "hover:text-foreground hover:bg-background transition-colors duration-300",
                )}
              >
                <Link href="/faq">Вопросы и ответы</Link>
              </Button>
              <Button
                asChild
                className={cn(
                  "bg-brand text-foreground h-12 rounded-[16px] px-4",
                  "hover:bg-brand-hover transition-colors duration-300",
                )}
              >
                <Link href="/support">Служба поддержки</Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:w-1/3">
            <div className="border-brand/20 relative flex h-64 w-64 flex-col items-center justify-center rounded-full border-4 p-6 text-center">
              <div className="border-brand animation-duration-[10s] absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
              <span className="text-brand text-5xl font-medium">1+</span>
              <span className="mt-1 text-sm font-medium uppercase">
                Года
                <br />
                Гарантии
              </span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
