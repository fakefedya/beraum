import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Container } from "@/src/components/shared/Container";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { Section } from "@/src/components/shared/Section";
import { buildImageUrl, cn } from "@/src/lib/utils";

const breadcrumbItems = [{ label: "Главная", href: "/" }, { label: "Дисконт" }];

export const HeroSection = () => {
  const heroImageUrl = buildImageUrl("pages/discount/discount-hero.jpg");

  return (
    <Section className="relative flex h-[85svh] min-h-125 w-full flex-col overflow-hidden lg:h-[85vh]">
      <div className="absolute inset-0 z-0">
        <SafeImage
          src={heroImageUrl}
          alt="Варочная панель Beraum"
          fill
          className="object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/50 to-transparent" />
      </div>

      <Container className={cn("relative z-10 w-full pt-24", "md:pt-32")}>
        <Breadcrumbs
          items={breadcrumbItems}
          className={cn(
            "flex justify-center",
            "[&_ol]:text-white/60",
            "[&_a]:text-white/80 hover:[&_a]:text-white",
            "[&_[aria-current='page']]:text-white",
            "[&_svg]:text-white/40",
          )}
        />
      </Container>

      <Container className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 pb-12">
        <h1 className="text-center text-4xl font-semibold text-balance text-white drop-shadow-lg md:text-6xl lg:text-7xl">
          Дисконт Beraum
        </h1>
      </Container>
    </Section>
  );
};
