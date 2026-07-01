"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import type { ValidatedSlide } from "@/src/server/actions/hero";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export const HeroSlider = ({ slides }: { slides: ValidatedSlide[] }) => {
  if (!slides.length) return null;

  return (
    <Swiper
      modules={[Autoplay, Pagination, EffectFade]}
      effect="fade"
      pagination={{ clickable: true }}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      loop={slides.length > 1}
      className="h-full w-full"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={slide.id} className="relative h-full w-full">
          <Image
            src={slide.imageUrl}
            alt="Hero Banner"
            fill
            className="object-cover"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
            quality={75}
          />

          {/* Отрисовка в зависимости от типа (Type Guards из Zod) */}
          {slide.type === "product_tags" && (
            <div className="absolute inset-0 z-20">
              {slide.tags.map((tag, i) => (
                <Link
                  key={i}
                  href={tag.href}
                  className="absolute flex items-center gap-2 rounded-full bg-white/80 p-2 text-sm shadow-md backdrop-blur-md transition hover:bg-white"
                  style={{ left: `${tag.xPercent}%`, top: `${tag.yPercent}%` }}
                >
                  <span className="flex h-3 w-3 animate-pulse rounded-full bg-black" />
                  <div className="flex flex-col">
                    <span className="font-medium text-black">{tag.title}</span>
                    <span className="text-xs text-gray-600">
                      {tag.subtitle}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {slide.type === "promo_card" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="flex max-w-md flex-col gap-4 rounded-2xl bg-white/20 p-8 shadow-2xl backdrop-blur-xl">
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
