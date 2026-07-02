"use client";

import Image from "next/image";
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

import {
  getActiveSlides,
  type ValidatedSlide,
} from "@/src/server/actions/hero";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface HeroSliderProps {
  slides: ValidatedSlide[];
}

export const HeroSlider = ({ slides: initialSlides }: HeroSliderProps) => {
  const { data: slides } = useSWR(
    "hero-slides",
    async () => {
      const response = await getActiveSlides();
      return response.success && response.data ? response.data : [];
    },
    {
      fallbackData: initialSlides, // КРИТИЧНО: Отдаем SWR серверные данные для мгновенного первого рендера
      refreshInterval: 30000, // Фоновое обновление каждые 30 секунд (30000 мс)
      revalidateOnFocus: true, // Обновлять данные, если пользователь свернул браузер и вернулся
    },
  );

  if (!slides || slides.length === 0) {
    return (
      <div className="bg-surface-gray flex h-full w-full flex-col items-center justify-center">
        <div className="bg-glass mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-sm">
          <span className="animate-pulse text-4xl text-black/20">B</span>
        </div>
        <h1 className="text-black-muted text-2xl font-medium">
          Коллекции Beraum обновляются...
        </h1>
        <p className="mt-2 text-sm text-black/40">
          Скоро здесь появятся новые предложения
        </p>
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
      autoplay={{ delay: 6000, disableOnInteraction: false }}
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
            <Image
              src={slide.imageUrl}
              alt="Hero Banner"
              fill
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="100vw"
              quality={95}
            />
          </div>

          {slide.type === "product_tags" && (
            <div className="absolute inset-0 z-20">
              {slide.tags.map((tag, i) => (
                <Link
                  key={i}
                  href={tag.href}
                  className="bg-brand shadow-card absolute flex items-center gap-2 rounded-full p-1 backdrop-blur-md transition-colors duration-300 hover:bg-white"
                  style={{ left: `${tag.xPercent}%`, top: `${tag.yPercent}%` }}
                  data-swiper-parallax="-300"
                  data-swiper-parallax-opacity="0"
                >
                  <div className="bg-surface-gray hover:bg-brand flex flex-col items-end rounded-full px-6 py-2 transition-colors duration-300">
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

          {/* === РЕНДЕР ПРОМО-КАРТОЧКИ === */}
          {slide.type === "promo_card" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div
                className="flex max-w-md flex-col gap-4 rounded-2xl bg-white/20 p-8 shadow-2xl backdrop-blur-xl"
                data-swiper-parallax="-500" // Эффект выезда карточки
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
