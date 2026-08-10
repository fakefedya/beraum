import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";

export const HeroSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="mx-auto flex flex-col items-center justify-center gap-8 text-center">
          <h1 className="text-5xl font-medium lg:text-6xl">
            Мы не выдумываем легенды. <br className="hidden md:block" />
            Мы создаем продукт.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed lg:text-lg">
            Beraum — российский бренд с абсолютной прозрачностью процессов. Наша
            техника проектируется с жестким фокусом на интерьерную эстетику и
            собирается на передовых производственных линиях Китая, обеспечивая
            качество уровня мировых лидеров без переплат за псевдоисторию.
          </p>
        </div>
      </Container>
    </Section>
  );
};
