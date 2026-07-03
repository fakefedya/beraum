import { getActiveSlides } from "@/src/server/actions/banners";
import { Metadata } from "next";
import { HeroSlider } from "./_components/hero/HeroSlider";

export const metadata: Metadata = {
  title: "Beraum",
  description: "Какое-то описание",
};

export default async function Home() {
  const { data: slides } = await getActiveSlides();
  console.log(slides);

  return (
    <div className="flex w-full flex-col">
      <section className="relative h-dvh w-full">
        <HeroSlider slides={slides} />
      </section>
    </div>
  );
}
