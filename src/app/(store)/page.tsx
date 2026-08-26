import { getActiveSlides } from "@/src/server/queries/banners";
import { Metadata } from "next";
import { HeroSlider } from "./_components/HeroSlider";

export const metadata: Metadata = {
  title: "Бытовая техника с ярким дизайном по доступной цене — Beraum",
  description:
    "Официальный магазин Beraum. Проектируем технику с фокусом на интерьерную эстетику. Официальная гарантия, доставка по всей России.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Beraum",
  },
};

export default async function Home() {
  const { data: slides } = await getActiveSlides();
  return (
    <section className="relative h-dvh w-full">
      <HeroSlider slides={slides} />
    </section>
  );
}
