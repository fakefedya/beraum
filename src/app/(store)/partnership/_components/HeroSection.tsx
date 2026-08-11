"use client";

import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export const HeroSection = () => {
  const handleScrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href")?.replace("#", "");

    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="mx-auto flex flex-col items-center justify-center gap-8 text-center">
          <h1 className="text-5xl font-medium lg:text-6xl">Сотрудничество</h1>
          <p className="text-muted-foreground text-lg leading-relaxed lg:text-lg">
            Мы открыты к долгосрочному партнерству и предлагаем гибкие
            B2B-решения, обеспечивая стабильные поставки, резерв товара и
            прозрачный документооборот.
          </p>
          <Button
            asChild
            className={cn(
              "bg-foreground text-background h-12 gap-4 rounded-[16px] px-8 text-base font-medium",
              "hover:bg-foreground/80 duration-300",
            )}
          >
            <a href="#partnership-form" onClick={handleScrollToForm}>
              Получить индивидуальные условия
            </a>
          </Button>
        </div>
      </Container>
    </Section>
  );
};
