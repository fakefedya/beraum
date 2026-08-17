import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";

export const HeroSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="mx-auto flex flex-col items-center justify-center gap-8 text-center">
          <h1 className="text-5xl font-medium lg:text-6xl">
            Честная гарантия. <br className="hidden md:block" />
            Никакого мелкого шрифта.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed lg:text-lg">
            Мы абсолютно уверены в качестве нашей техники, поэтому предоставляем
            полную гарантию от 1 года на все устройства Beraum. Если что-то
            пошло не так — мы решим проблему быстро и без бюрократии.
          </p>
        </div>
      </Container>
    </Section>
  );
};
