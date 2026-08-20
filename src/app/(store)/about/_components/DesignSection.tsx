import { Container } from "@/src/components/shared/Container";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { Section } from "@/src/components/shared/Section";
import { Button } from "@/src/components/ui/button";
import { cn, buildImageUrl } from "@/src/lib/utils";
import { ExternalLink } from "lucide-react";

export const DesignSection = () => {
  const imageUrl = buildImageUrl("pages/about/studio-design-banner.png");

  return (
    <Section>
      <Container maxWidth="5xl">
        <div
          className={cn(
            "bg-card flex w-full flex-col-reverse overflow-hidden rounded-4xl",
            "md:flex-row",
          )}
        >
          <div
            className={cn(
              "flex flex-col justify-center gap-6 p-6",
              "md:w-1/2 md:p-10",
              "lg:p-16",
            )}
          >
            <h2
              className={cn(
                "text-2xl font-medium",
                "md:text-3xl",
                "lg:text-4xl",
              )}
            >
              Техника, которая понимает интерьер
            </h2>
            <p className="text-muted-foreground">
              Для нас варочная панель или вытяжка — это не просто устройство, а
              полноправный элемент интерьера кухни. Наше внимание к интеграции
              техники в пространство зашло так далеко, что мы открыли
              собственную студию дизайна интерьеров.
            </p>
            <p className="text-muted-foreground">
              Мы на практике знаем, как важны матовые фактуры, геометрия линий и
              правильные зазоры.
            </p>
            <Button
              asChild
              className={cn(
                "text-foreground bg-brand-secondary mt-8 hidden h-12 items-center gap-2 rounded-[16px] px-2 text-base font-medium",
                "w-fit lg:flex xl:gap-4 xl:px-4",
                "hover:bg-brand-secondary/80 transition-colors duration-300",
              )}
            >
              <a
                href="https://design.beraum.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Перейти в студию дизайна
                <ExternalLink />
              </a>
            </Button>
          </div>
          <div
            className={cn("relative min-h-75 w-full", "md:w-1/2 lg:min-h-full")}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <SafeImage
                src={imageUrl}
                alt="Изображение интерьера"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
