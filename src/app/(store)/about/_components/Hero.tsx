import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";

export const HeroSection = () => {
  return (
    <Section>
      <Container>
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 text-center">
          <h1 className="text-5xl font-medium lg:text-6xl">
            Мы не придумываем легенды. <br className="hidden md:block" />
            Мы создаем продукт.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed lg:text-lg">
            Рынок переполнен «брендами-оборотнями», маскирующимися под
            несуществующие европейские заводы. Мы выбрали другой путь —
            абсолютную прозрачность. Beraum — это российский бренд. Наша техника
            проектируется с учетом строгих требований к эстетике и собирается на
            передовых производственных линиях Китая, на тех же заводах, где
            создают продукцию мировые лидеры индустрии.
          </p>
        </div>
      </Container>
    </Section>
  );
};
