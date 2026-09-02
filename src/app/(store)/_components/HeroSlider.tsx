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
import { ChevronRight } from "lucide-react";

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
              {slide.tags.map((tag, i) => {
                const xDesk = tag.xPercent;
                const yDesk = tag.yPercent;
                const xMob = tag.mobileXPercent ?? xDesk;
                const yMob = tag.mobileYPercent ?? yDesk;

                const isRightDesk = xDesk > 50;
                const isBottomDesk = yDesk > 50;
                const isRightMob = xMob > 50;
                const isBottomMob = yMob > 50;

                return (
                  <Link
                    key={i}
                    href={tag.href}
                    className={cn(
                      "group absolute z-30 transition-all duration-300 outline-none hover:z-40",
                      "top-(--y-mob) left-(--x-mob)",
                      "md:top-(--y-desk) md:left-(--x-desk)",
                    )}
                    style={
                      {
                        "--x-mob": `${xMob}%`,
                        "--y-mob": `${yMob}%`,
                        "--x-desk": `${xDesk}%`,
                        "--y-desk": `${yDesk}%`,
                      } as React.CSSProperties
                    }
                    data-swiper-parallax="-300"
                    data-swiper-parallax-opacity="0"
                  >
                    <div className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <span className="bg-brand absolute inline-flex h-full w-full animate-[ping_2s_ease-in-out_infinite] rounded-full" />
                      <span className="bg-card/80 ring-brand/50 relative flex h-4 w-4 items-center justify-center rounded-full shadow-sm ring-2">
                        <span className="bg-background/20 h-1 w-1 rounded-full" />
                      </span>
                    </div>

                    <div
                      className={cn(
                        "bg-background/80 shadow-nav absolute rounded-xl p-1 backdrop-blur-xl backdrop-saturate-150",

                        isRightMob ? "right-4" : "left-4",
                        isBottomMob ? "bottom-4" : "top-4",

                        isRightDesk
                          ? "md:right-4 md:left-auto"
                          : "md:right-auto md:left-4",
                        isBottomDesk
                          ? "md:top-auto md:bottom-4"
                          : "md:top-4 md:bottom-auto",
                      )}
                    >
                      <div className="bg-card flex items-center gap-2 rounded-lg px-4 py-2">
                        <div className="flex flex-col text-left">
                          <span className="text-muted-foreground text-xs font-medium whitespace-nowrap md:text-sm">
                            {tag.title}
                          </span>
                          <span className="text-foreground text-sm font-medium md:text-base">
                            {tag.subtitle}
                          </span>
                        </div>
                        <ChevronRight className="text-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-all duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
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
