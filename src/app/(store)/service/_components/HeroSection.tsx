import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { WARRANTY_FEATURES } from "@/src/app/(store)/service/_components/data";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "Гарантия" },
];

export const HeroSection = () => {
  const imageUrl = buildImageUrl("pages/service/service-banner-bg.png");

  return (
    <Section>
      <Container maxWidth="7xl" className={cn("pt-24", "md:pt-32")}>
        <div className="bg-brand-gradient relative flex flex-col gap-8 overflow-hidden rounded-4xl">
          <div
            className={cn(
              "absolute top-6 left-1/2 z-30 -translate-x-1/2",
              "md:top-8",
              "lg:top-10",
            )}
          >
            <Breadcrumbs
              items={breadcrumbItems}
              className="text-muted-foreground"
            />
          </div>

          <div
            className={cn(
              "relative flex flex-col-reverse px-6 pt-20",
              "md:pt-24",
              "lg:flex-row lg:px-16 lg:pt-32 lg:pb-50",
            )}
          >
            <div
              className={cn(
                "relative z-20 flex w-full flex-col gap-6",
                "lg:w-1/2",
              )}
            >
              <h1
                className={cn(
                  "text-foreground text-center text-4xl leading-tight font-semibold tracking-tight text-balance",
                  "md:text-left md:text-5xl lg:text-6xl",
                )}
              >
                Честная гарантия. <br className="hidden md:block" />
                Никакого мелкого шрифта.
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-pretty">
                Мы абсолютно уверены в качестве нашей техники, поэтому
                предоставляем полную гарантию от 1 года на все устройства
                Beraum. Если что-то пошло не так — мы решим проблему быстро и
                без бюрократии.
              </p>
            </div>

            <div
              className={cn(
                "5 relative z-0 aspect-square w-full",
                "lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-1/2",
              )}
            >
              <div className={cn("absolute inset-0 z-10")} />
              <SafeImage
                src={imageUrl}
                alt="Служба поддержки Beraum"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={cn("object-cover object-center")}
              />
            </div>
          </div>

          <div
            className={cn(
              "relative z-20 grid w-full grid-cols-1 gap-4 p-4 pt-0",
              "md:p-8 md:pt-0",
              "lg:-mt-16 lg:grid-cols-3 lg:px-12 lg:pt-0 lg:pb-12",
            )}
          >
            {WARRANTY_FEATURES.map((el, i) => {
              const Icon = el.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "bg-background/80 flex flex-col gap-4 rounded-4xl p-6 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
                    "hover:bg-background hover:shadow-md",
                    "lg:p-8",
                  )}
                >
                  <Icon
                    className="text-brand-secondary mb-2"
                    size={48}
                    strokeWidth={1.2}
                  />

                  <div className="flex flex-col gap-2">
                    <h3 className="text-foreground text-xl font-semibold tracking-tight">
                      {el.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {el.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
};
