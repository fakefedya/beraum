import { getActiveSlides } from "@/src/server/queries/banners";
import { Metadata } from "next";
import { HeroSlider } from "./_components/HeroSlider";

export const metadata: Metadata = {
  title: "Beraum",
  description: "Какое-то описание",
};

export default async function Home() {
  const { data: slides } = await getActiveSlides();
  return (
    <section className="relative h-dvh w-full">
      <HeroSlider slides={slides} />
    </section>
  );
}
