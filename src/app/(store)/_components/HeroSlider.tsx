"use client";

import Link from "next/link";
import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  EffectFade,
  Mousewheel,
  Keyboard,
  Parallax,
} from "swiper/modules";

import type { ValidatedSlide } from "@/src/server/queries/banners";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { EmptyState } from "@/src/components/ui/empty-state";
import { cn } from "@/src/lib/utils";
import { SafeImage } from "@/src/components/shared/SafeImage";

interface HeroSliderProps {
  slides: ValidatedSlide[];
}
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch slides");
  return json.data as ValidatedSlide[];
};

export const HeroSlider = ({ slides: initialSlides }: HeroSliderProps) => {
  const { data: slides } = useSWR<ValidatedSlide[]>(
    "/api/banners?placement=home_hero",
    fetcher,
    {
      fallbackData: initialSlides,
      refreshInterval: 30000,
      revalidateOnFocus: false,
    },
  );

  if (!slides || slides.length === 0) {
    return (
      <div className="bg-surface-gray h-full w-full">
        <EmptyState
          title="Коллекции обновляются..."
          description="Скоро здесь появятся новые предложения."
        />
      </div>
    );
  }

  return (
    <Swiper
      modules={[
        Autoplay,
        Pagination,
        EffectFade,
        Mousewheel,
        Keyboard,
        Parallax,
      ]}
      allowTouchMove={true}
      direction="vertical"
      speed={800}
      slidesPerView={1}
      parallax={true}
      edgeSwipeThreshold={20}
      mousewheel={{ enabled: true, sensitivity: 1, releaseOnEdges: true }}
      keyboard={{ enabled: true }}
      autoplay={{ enabled: false }}
      loop={slides.length > 1}
      pagination={{ enabled: true, clickable: true }}
      className="h-full w-full [&_.swiper-pagination]:right-4! [&_.swiper-pagination-bullet-active]:bg-white!"
    >
      {slides.map((slide, index) => (
        <SwiperSlide
          key={slide.id}
          className="relative h-full w-full overflow-hidden"
        >
          <div
            className="absolute inset-0 z-0 h-full w-full"
            data-swiper-parallax-scale="1.1"
          >
            <SafeImage
              src={slide.imageUrl}
              alt="Hero Banner Desktop"
              fill
              className={
                slide.mobileImageUrl
                  ? "hidden object-cover md:block"
                  : "object-cover"
              }
              preload={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="100vw"
            />
            {slide.mobileImageUrl && (
              <SafeImage
                src={slide.mobileImageUrl}
                alt="Hero Banner Mobile"
                fill
                className="block object-cover md:hidden"
                preload={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes="100vw"
              />
            )}
          </div>

          {slide.type === "promo_product" && (
            <div className="absolute inset-0 z-20">
              {slide.tags.map((tag, i) => (
                <Link
                  key={i}
                  href={tag.href}
                  className={cn(
                    "bg-background/90 border-brand/90 shadow-nav absolute flex items-center gap-2 rounded-full border-4 backdrop-blur-xl backdrop-saturate-150",
                    "hover:bg-background hover:border-brand transition-colors duration-300",
                  )}
                  style={{ left: `${tag.xPercent}%`, top: `${tag.yPercent}%` }}
                  data-swiper-parallax="-300"
                  data-swiper-parallax-opacity="0"
                >
                  <div className="flex flex-col rounded-full px-6 py-2">
                    <span className="text-black-muted text-xs leading-3">
                      {tag.title}
                    </span>
                    <span className="text-base font-medium text-black">
                      {tag.subtitle}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {slide.type === "promo_information" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div
                className="flex max-w-md flex-col gap-4 rounded-2xl bg-white/20 p-8 shadow-2xl backdrop-blur-xl"
                data-swiper-parallax="-500"
                data-swiper-parallax-opacity="0"
              >
                <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
                <p className="text-white/90">{slide.description}</p>
                <Link
                  href={slide.href}
                  className="w-fit rounded-full bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
