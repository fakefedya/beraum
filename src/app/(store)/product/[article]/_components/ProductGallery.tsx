"use client";

import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { Maximize2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const ProductGallery = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Временная эмуляция 4 слайдов
  const placeholders = Array.from({ length: 4 });

  const openFullscreen = () => dialogRef.current?.showModal();
  const closeFullscreen = () => dialogRef.current?.close();

  // Изолированный UI-компонент CSS-заглушки
  const PlaceholderCard = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-black/5 text-black/20",
        className,
      )}
    >
      <ImageIcon className="h-1/4 max-h-32 w-1/4 max-w-32" strokeWidth={1} />
    </div>
  );

  return (
    <div className="relative flex h-full w-full flex-col gap-4">
      <div className="group bg-card relative h-full w-full overflow-hidden rounded-lg">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="h-full w-full"
        >
          {placeholders.map((_, i) => (
            <SwiperSlide
              key={i}
              className="flex h-full w-full items-center justify-center p-8"
            >
              <PlaceholderCard className="rounded-2xl" />
            </SwiperSlide>
          ))}
        </Swiper>

        <Button
          variant="white"
          size="icon"
          onClick={openFullscreen}
          className="absolute top-4 right-4 z-10 opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 focus:opacity-100"
          aria-label="Открыть на весь экран"
        >
          <Maximize2 className="h-4 w-4 text-black" />
        </Button>
      </div>

      {/* Нативный Dialog для Fullscreen */}
      <dialog
        ref={dialogRef}
        className="open:animate-in open:fade-in-0 m-auto h-[95dvh] w-[95dvw] max-w-7xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
        onCancel={closeFullscreen}
      >
        <div className="relative h-full w-full bg-white">
          <Button
            variant="white"
            size="icon"
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-50 shadow-md"
          >
            <X className="h-5 w-5 text-black" />
          </Button>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ type: "fraction" }}
            initialSlide={activeIndex}
            className="h-full w-full"
          >
            {placeholders.map((_, i) => (
              <SwiperSlide
                key={`fs-${i}`}
                className="flex h-full w-full items-center justify-center p-4 md:p-12"
              >
                <PlaceholderCard className="rounded-xl" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </dialog>
    </div>
  );
};
