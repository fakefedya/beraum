import { Metadata } from "next";
import { Container } from "@/src/components/shared/Container";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { SafeImage } from "@/src/components/shared/SafeImage";
import { RetailTab } from "./_components/RetailTab";
import { WholesaleTab } from "./_components/WholesaleTab";
import { DiscountToggle } from "./_components/DiscountToggle";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { Section } from "@/src/components/shared/Section";

export const metadata: Metadata = {
  title: "Уцененная и оптовая техника",
  description:
    "Оригинальная техника Beraum со скидками до 50%. Розничные продажи через Ozon и специальные условия для оптовых партнеров.",
};

const breadcrumbItems = [{ label: "Главная", href: "/" }, { label: "Дисконт" }];

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DiscountPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const mode = resolvedParams.mode === "wholesale" ? "wholesale" : "retail";
  const heroImageUrl = buildImageUrl("pages/discount/discount-hero.jpg");

  return (
    <div className={cn("flex flex-col gap-10", "md:gap-20")}>
      <Section className="relative flex h-[70svh] min-h-125 w-full flex-col overflow-hidden lg:h-[70vh]">
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={heroImageUrl}
            alt="Варочная панель Beraum"
            fill
            className="object-cover object-top"
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

      <div className="sticky top-20 z-40 -mt-8 mb-8 flex w-full justify-center px-4 md:top-24">
        <DiscountToggle currentMode={mode} />
      </div>

      <div className="relative z-20">
        {mode === "retail" ? <RetailTab /> : <WholesaleTab />}
      </div>
    </div>
  );
}
