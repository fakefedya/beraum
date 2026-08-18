import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { TRUST_TECHNOLOGIES } from "@/src/app/(store)/about/_components/data";
import { SafeImage } from "@/src/components/shared/SafeImage";

export const QualityControlSection = () => {
  const imageUrl = buildImageUrl("/pages/about/technology-banner.jpg");
  return (
    <Section>
      <Container maxWidth="5xl" className="gap-12">
        <h2
          className={cn(
            "text-center text-3xl font-medium",
            "md:text-4xl",
            "lg:text-5xl",
          )}
        >
          Технологии доверия
        </h2>
        <div
          className={cn(
            "grid auto-rows-[minmax(250px,auto)] grid-cols-1 gap-6",
            "md:grid-cols-3",
          )}
        >
          <div
            className={cn(
              "relative flex aspect-2/3 items-end overflow-hidden rounded-4xl p-6",
              "md:col-span-3 md:aspect-3/2 md:p-10",
              "lg:p-16",
            )}
          >
            <SafeImage
              src={imageUrl}
              alt="Фабрика"
              fill
              className="-z-10 object-cover"
            />
            <div className="from-foreground/80 absolute inset-0 -z-10 bg-linear-to-t via-black/30 to-transparent" />
            <div className="relative z-10 max-w-3xl text-white">
              <h3 className="mb-3 text-2xl font-medium lg:text-3xl">
                Глобальное производство
              </h3>
              <p className="text-base leading-relaxed text-white/80 lg:text-lg">
                Мы выпускаем продукцию на крупнейшей в мире фабрике бытовой
                кухонной техники. Использование единой компонентной базы с
                лидерами индустрии позволяет нам быть абсолютно уверенными в
                качестве каждого устройства.
              </p>
            </div>
          </div>

          {TRUST_TECHNOLOGIES.map((el, idx) => (
            <div key={idx} className="">
              <div className="relative flex aspect-2/3 items-end overflow-hidden rounded-4xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <SafeImage
                    src={buildImageUrl(el.image)}
                    alt="Изображение интерьера"
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                </div>
                <div
                  className={cn(
                    "relative z-10 flex flex-col gap-2 p-6",
                    "lg:p-8",
                  )}
                >
                  <h3 className="text-background text-xl font-medium">
                    {el.title}
                  </h3>
                  <p className="text-background/80 text-base">{el.desc}</p>
                </div>
                <div className="from-foreground/80 absolute inset-0 z-1 bg-linear-to-t via-black/60 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
