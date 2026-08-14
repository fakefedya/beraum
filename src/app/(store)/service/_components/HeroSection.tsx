import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";

export const HeroSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="mx-auto flex flex-col items-center justify-center gap-8 text-center">
          <div className="bg-brand/10 text-brand-secondary-muted inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="bg-brand-secondary-muted absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-brand-secondary-muted relative inline-flex h-2 w-2 rounded-full"></span>
            </span>
            Официальная поддержка
          </div>
          <h1 className="text-5xl font-medium tracking-tight text-balance lg:text-7xl">
            Честная гарантия. <br className="hidden md:block" />
            Никакого мелкого шрифта.
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed text-balance lg:text-xl">
            Мы абсолютно уверены в качестве нашей техники, поэтому предоставляем
            полную гарантию 12 месяцев на все устройства Beraum. Если что-то
            пошло не так — мы решим проблему быстро и без бюрократии.
          </p>
        </div>
      </Container>
    </Section>
  );
};
