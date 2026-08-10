"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { SYSTEM_ASSETS } from "@/src/lib/constants/assets";

interface SafeImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export const SafeImage = ({
  src,
  alt,
  fallbackSrc = SYSTEM_ASSETS.emptyProduct,
  ...props
}: SafeImageProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === src ? fallbackSrc : src;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (failedSrc !== src && src !== fallbackSrc) {
          setFailedSrc(src);
        }
      }}
    />
  );
};
