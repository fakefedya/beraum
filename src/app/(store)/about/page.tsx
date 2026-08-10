import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Icons } from "@/src/components/ui/icons";
import { Button } from "@/src/components/ui/button";
import { HeroSection } from "./_components/HeroSection";
import { StatisticSection } from "./_components/StatisticSection";
import { DesignSection } from "./_components/DesignSection";
import { QualityControlSection } from "./_components/QualityControlSection";

export const metadata: Metadata = {
  title: "О бренде Beraum | Честная техника для современного интерьера",
  description:
    "Узнайте правду о производстве Beraum. Честный российский бренд, передовые заводы Китая и фокус на интеграции техники в интерьер.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "О бренде" },
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <Container className="pt-32">
          <Breadcrumbs
            items={breadcrumbItems}
            className="flex justify-center"
          />
        </Container>
      </Section>

      <HeroSection />
      <StatisticSection />
      <DesignSection />
      <QualityControlSection />

      <Section>
        <Container className="flex flex-col gap-24">
          {/* 5. БЛОК ГАРАНТИИ: Снятие финальных рисков */}
          <div className="bg-foreground text-background mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-12 rounded-[32px] p-10 lg:flex-row lg:p-16">
            <div className="flex flex-col gap-6 text-center lg:w-2/3 lg:text-left">
              <Icons.logo className="mx-auto h-8 w-auto fill-current lg:mx-0" />
              <h2 className="text-3xl font-medium lg:text-4xl">
                Поддержка без бюрократии
              </h2>
              <p className="text-background/80 text-lg leading-relaxed">
                Прямые продажи означают прямую ответственность. У нас нет
                сложной цепи дистрибьюторов, перекидывающих вину друг на друга.
                На всю технику действует официальная гарантия 12 месяцев.
                Собственный сервисный центр и склад запчастей в РФ позволяют
                решать вопросы напрямую и в кратчайшие сроки.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Button
                  asChild
                  variant="outline"
                  className="text-background border-background/20 hover:bg-background hover:text-foreground h-12 rounded-[16px] bg-transparent px-8"
                >
                  <Link href="/service">Условия гарантии</Link>
                </Button>
                <Button
                  asChild
                  className="bg-brand text-foreground hover:bg-brand-hover h-12 rounded-[16px] px-8"
                >
                  <Link href="/support">Служба поддержки</Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:w-1/3">
              <div className="border-brand/20 relative flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 p-6 text-center">
                <div className="border-brand absolute inset-0 animate-spin rounded-full border-4 border-t-transparent [animation-duration:10s]" />
                <span className="text-brand text-5xl font-medium">1</span>
                <span className="mt-1 text-sm font-medium tracking-widest uppercase">
                  Год
                  <br />
                  Гарантии
                </span>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
