import { getActiveSlides } from "@/src/server/actions/hero";
import { Metadata } from "next";
import { HeroSlider } from "./_components/hero/HeroSlider";

export const metadata: Metadata = {
  title: "Beraum",
  description: "Какое-то описание",
};

export default async function Home() {
  // 1. Сходили в базу
  const { data: slides } = await getActiveSlides();
  console.log(slides);

  return (
    <div className="flex w-full flex-col">
      {/* 2. Отрендерили секцию */}
      <section className="relative h-[100dvh] w-full">
        <HeroSlider slides={slides} />
      </section>
    </div>
  );
}
