import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { SYSTEM_ASSETS, STORAGE_URL } from "@/src/lib/constants";
import { TRUST_TECHNOLOGIES } from "@/src/app/(store)/about/_components/data";

export const QualityControlSection = () => {
  const imageUrl = `${STORAGE_URL}/system-assets/about_technology.jpg`
    ? `${STORAGE_URL}/system-assets/about_technology.jpg`
    : SYSTEM_ASSETS.placeholder;
  return (
    <Section>
      <Container className="max-w-5xl gap-12">
        <h2 className={cn("text-center text-3xl font-medium", "lg:text-5xl")}>
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
              "relative flex aspect-3/2 items-end overflow-hidden rounded-4xl p-6",
              "md:col-span-3 lg:p-16",
            )}
          >
            <Image
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
            <div
              key={idx}
              className="bg-background border-border hover:border-black-muted group relative flex flex-col gap-4 overflow-hidden rounded-3xl border p-8 transition-colors duration-300"
            >
              <div className="bg-brand/20 text-brand-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-medium">
                {idx + 1}
              </div>
              <div className="relative z-10 flex flex-col gap-2">
                <h3 className="text-xl leading-tight font-medium">
                  {el.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {el.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
