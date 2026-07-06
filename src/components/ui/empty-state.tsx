import * as React from "react";
import { cn } from "@/src/lib/utils";
import Image from "next/image";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  imageUrl?: string;
}

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:9000";
const DEFAULT_IMAGE = `${STORAGE_URL}/system-assets/empty_state_cover.png`;

export const EmptyState = ({
  title = "Упс! Кажется, данные не загрузились",
  description = "Попробуйте обновить страницу или загляните позже. Мы уже работаем над этим.",
  imageUrl = DEFAULT_IMAGE,
  className,
  ...props
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "animate-in fade-in relative flex h-full min-h-100 w-full flex-col items-center justify-center bg-white text-center duration-500",
        className,
      )}
      {...props}
    >
      <div className="absolute top-[30%] z-1 flex max-w-lg flex-col gap-2 p-4">
        <h3 className="text-3xl font-medium text-black">{title}</h3>
        <p className="text-black-muted text-base">{description}</p>
      </div>

      <div className="z-0 h-full w-full shrink-0">
        <Image
          src={imageUrl}
          alt="Данные не найдены"
          fill
          className="pointer-events-none object-cover"
        />
      </div>
    </div>
  );
};
