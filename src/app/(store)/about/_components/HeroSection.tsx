import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { cn } from "@/src/lib/utils";

export const HeroSection = () => {
  return (
    <Section>
      <Container maxWidth="4xl">
        <div className="mx-auto flex flex-col items-center justify-center gap-6 text-center">
          <h1
            className={cn(
              "text-foreground text-4xl font-semibold tracking-tight text-balance",
              "md:text-5xl lg:text-6xl",
            )}
          >
            Мы не выдумываем легенды. <br className="hidden md:block" />
            Мы создаем продукт.
          </h1>

          <div className="mx-auto mt-2 flex max-w-2xl flex-col gap-4">
            <p
              className={cn(
                "text-foreground/90 text-lg leading-relaxed font-medium text-pretty",
                "md:text-xl",
              )}
            >
              Beraum — российский бренд с абсолютной прозрачностью процессов.
            </p>
            <p
              className={cn(
                "text-muted-foreground text-base leading-relaxed text-pretty",
                "md:text-lg",
              )}
            >
              Наша техника проектируется с жестким фокусом на интерьерную
              эстетику и собирается на передовых производственных линиях Китая,
              обеспечивая качество уровня мировых лидеров без переплат за
              псевдоисторию.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};
