"use client";

import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Pagination } from "swiper/modules"; // 🚀 Убрали Navigation
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import "swiper/css";
import "swiper/css/pagination";

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
        className="hover:text-background shadow-button transition-text disabled:text-background/50 text-background/80 pointer-events-auto h-12 w-12 bg-[#71717199] backdrop-blur-lg duration-300 hover:bg-[#71717199] focus:opacity-100 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Предыдущее фото"
      >
        <ChevronLeft className="size-5 text-inherit" />
      </Button>
      <Button
        size="icon"
        onClick={() => swiper.slideNext()}
        disabled={isEnd}
        className="hover:text-background shadow-button transition-text disabled:text-background/50 text-background/80 pointer-events-auto h-12 w-12 bg-[#71717199] backdrop-blur-lg duration-300 hover:bg-[#71717199] focus:opacity-100 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Следующее фото"
      >
        <ChevronRight className="size-5 text-inherit" />
      </Button>
    </div>
  );
};

export const ProductGallery = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Временная эмуляция 4 слайдов
  const placeholders = Array.from({ length: 4 });

  const openFullscreen = () => dialogRef.current?.showModal();
  const closeFullscreen = () => dialogRef.current?.close();

  const PlaceholderCard = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className,
      )}
    ></div>
  );

  return (
    <div className="relative flex h-full w-full flex-col gap-4">
      <div className="group bg-card relative h-full w-full overflow-hidden rounded-lg">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="[&_.swiper-pagination-bullet-active]:bg-background! h-full w-full [&_.swiper-pagination]:bottom-6!"
        >
          {placeholders.map((_, i) => (
            <SwiperSlide
              key={i}
              className="flex h-full w-full items-center justify-center p-8"
            >
              <PlaceholderCard className="rounded-2xl" />
            </SwiperSlide>
          ))}

          <GalleryNavigation />
        </Swiper>

        <Button
          variant="white"
          size="icon"
          onClick={openFullscreen}
          className="absolute top-4 right-4 z-20 opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 focus:opacity-100"
          aria-label="Открыть на весь экран"
        >
          <Maximize2 className="h-4 w-4 text-black" />
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        className="open:animate-in open:fade-in-0 m-auto h-[95dvh] w-[95dvw] max-w-7xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
        onCancel={closeFullscreen}
      >
        <div className="group relative h-full w-full bg-white">
          <Button
            variant="white"
            size="icon"
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-50 shadow-md"
          >
            <X className="h-5 w-5 text-black" />
          </Button>
          <Swiper
            modules={[Pagination]} // 🚀 Здесь тоже убираем дефолтную навигацию
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

            {/* Навигация работает и в полноэкранном режиме */}
            <GalleryNavigation />
          </Swiper>
        </div>
      </dialog>
    </div>
  );
};
