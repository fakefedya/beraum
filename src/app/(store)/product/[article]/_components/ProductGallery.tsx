"use client";

import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Pagination } from "swiper/modules";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  Breadcrumbs,
  type BreadcrumbType,
} from "@/src/components/shared/Breadcrumbs";
import Image from "next/image";
import { SYSTEM_ASSETS } from "@/src/lib/constants";

import "swiper/css";
import "swiper/css/pagination";

export type GalleryImage = {
  url: string;
  fit: "contain" | "cover";
};

interface ProductGalleryProps {
  breadcrumbs?: BreadcrumbType[];
  images?: GalleryImage[];
}

const GalleryNavigation = () => {
  const swiper = useSwiper();
  const [isBeginning, setIsBeginning] = useState(swiper.isBeginning);
  const [isEnd, setIsEnd] = useState(swiper.isEnd);

  useEffect(() => {
    const handleSlideChange = () => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    };

    swiper.on("slideChange", handleSlideChange);
    return () => {
      swiper.off("slideChange", handleSlideChange);
    };
  }, [swiper]);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 left-0 z-10 flex w-full items-center justify-between px-6">
      <Button
        size="icon"
        onClick={() => swiper.slidePrev()}
        disabled={isBeginning}
        className={cn(
          "bg-background/80 shadow-nav pointer-events-auto h-12 w-12 rounded-full backdrop-blur-xl backdrop-saturate-150",
          "hover:text-foreground hover:bg-background transition-all duration-300",
          "focus:opacity-100",
          "disabled:pointer-events-none disabled:opacity-0",
          "text-foreground/50",
        )}
        aria-label="Предыдущее фото"
      >
        <ChevronLeft className="size-6 text-inherit" />
      </Button>
      <Button
        size="icon"
        onClick={() => swiper.slideNext()}
        disabled={isEnd}
        className={cn(
          "bg-background/80 shadow-nav pointer-events-auto h-12 w-12 rounded-full backdrop-blur-xl backdrop-saturate-150",
          "hover:text-foreground hover:bg-background transition-all duration-300",
          "focus:opacity-100",
          "disabled:pointer-events-none disabled:opacity-0",
          "text-foreground/50",
        )}
        aria-label="Следующее фото"
      >
        <ChevronRight className="size-6 text-inherit" />
      </Button>
    </div>
  );
};

export const ProductGallery = ({
  breadcrumbs,
  images = [],
}: ProductGalleryProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages: GalleryImage[] =
    images.length > 0
      ? images
      : [{ url: SYSTEM_ASSETS.placeholder, fit: "contain" }];

  const openFullscreen = () => dialogRef.current?.showModal();
  const closeFullscreen = () => dialogRef.current?.close();

  return (
    <div className="relative flex h-full w-full flex-col gap-4">
      <div className="group bg-card relative h-full w-full items-center overflow-hidden rounded-[24px]">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div
            className={cn(
              "pointer-events-auto absolute top-6 left-6 z-30 hidden w-fit justify-start",
              "lg:flex",
            )}
          >
            <Breadcrumbs
              items={breadcrumbs}
              className="bg-background/80 shadow-nav flex gap-2 rounded-[12px] px-4 py-1.5 backdrop-blur-xl backdrop-saturate-150"
            />
          </div>
        )}

        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className={cn(
            "h-full w-full",
            "[&_.swiper-pagination-bullet-active]:bg-background! [&_.swiper-pagination]:bottom-6!",
          )}
        >
          {displayImages.map((image, i) => (
            <SwiperSlide
              key={i}
              className="relative flex h-full w-full items-center justify-center"
            >
              <button
                className={cn(
                  "absolute inset-0 z-0 cursor-zoom-in outline-none",
                  "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset",
                )}
                onClick={openFullscreen}
                type="button"
                tabIndex={0}
                aria-label="Открыть изображение на весь экран"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFullscreen();
                  }
                }}
              >
                <Image
                  src={image.url}
                  alt={`Фото товара ${i + 1}`}
                  fill
                  className={cn(
                    "transition-all duration-300",
                    image.fit === "cover" ? "object-cover" : "object-contain",
                  )}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority={i === 0}
                />
              </button>
            </SwiperSlide>
          ))}

          <GalleryNavigation />
        </Swiper>
      </div>

      <dialog
        ref={dialogRef}
        className={cn(
          "m-auto h-[95dvh] w-[95dvw] max-w-7xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-[#202028]/80 backdrop:backdrop-blur-sm",
          "open:animate-in open:fade-in-0",
        )}
        onCancel={closeFullscreen}
      >
        <div className="group relative h-full w-full bg-white">
          <Button
            onClick={closeFullscreen}
            className={cn(
              "bg-background/80 shadow-nav absolute top-4 right-4 z-50 h-12 w-12 rounded-full backdrop-blur-xl backdrop-saturate-150",
              "hover:bg-background duration-300",
            )}
          >
            <X className="text-foreground size-6" />
          </Button>
          <Swiper
            modules={[Pagination]}
            pagination={{ type: "bullets", clickable: true }}
            initialSlide={activeIndex}
            className={cn(
              "h-full w-full",
              "[&_.swiper-pagination-bullet-active]:bg-background! [&_.swiper-pagination]:bottom-6!",
            )}
          >
            {displayImages.map((image, i) => (
              <SwiperSlide
                key={i}
                className="relative flex h-full w-full items-center justify-center text-sm"
              >
                <Image
                  src={image.url}
                  alt={`Фото товара ${i + 1} крупно`}
                  fill
                  className={cn(
                    "transition-all duration-300",
                    image.fit === "cover" ? "object-cover" : "object-contain",
                  )}
                  sizes="(max-width: 1024px) 100vw, 95vw"
                  priority={i === activeIndex}
                />
              </SwiperSlide>
            ))}

            <GalleryNavigation />
          </Swiper>
        </div>
      </dialog>
    </div>
  );
};
