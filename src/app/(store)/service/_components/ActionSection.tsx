import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

export const ActionSection = () => {
  return (
    <Section className="my-32">
      <Container maxWidth="5xl">
        <div
          className={cn(
            "bg-foreground text-background flex w-full flex-col items-center justify-between gap-10 p-12 md:flex-row lg:p-16",
            "rounded-4xl rounded-tr-[128px] rounded-bl-[128px]", // Форма листа, но отраженная для разнообразия
          )}
        >
          <div className="flex flex-col gap-4 text-center md:w-2/3 md:text-left">
            <h2 className="text-3xl font-medium tracking-tight lg:text-4xl">
              Случилась неисправность?
            </h2>
            <p className="text-background/80 max-w-xl text-lg leading-relaxed">
              Не переживайте. Создайте обращение в службу поддержки. Приложите
              фото электронного чека из маркетплейса и опишите проблему. Наши
              инженеры свяжутся с вами для решения вопроса.
            </p>
          </div>
          <div className="flex justify-center md:w-1/3 md:justify-end">
            <Button
              asChild
              className="bg-brand text-foreground hover:bg-brand-hover shadow-button h-14 rounded-[16px] px-8 text-lg font-medium"
            >
              <Link href="/support">Создать обращение</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
};
