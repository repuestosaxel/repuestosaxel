"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { DEFAULT_PRODUCT_IMAGE, supportsNextImageOptimizer } from "@/lib/product-image";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({
  src,
  alt,
  className,
  fill = true,
  sizes,
  priority
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || DEFAULT_PRODUCT_IMAGE);

  useEffect(() => {
    setCurrentSrc(src || DEFAULT_PRODUCT_IMAGE);
  }, [src]);

  const imageClass = cn("object-cover", className);
  const useNextImage = supportsNextImageOptimizer(currentSrc);

  if (!useNextImage) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", imageClass)}
          onError={() => setCurrentSrc(DEFAULT_PRODUCT_IMAGE)}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        className={imageClass}
        onError={() => setCurrentSrc(DEFAULT_PRODUCT_IMAGE)}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "(max-width: 768px) 100vw, 320px"}
      priority={priority}
      className={imageClass}
      onError={() => setCurrentSrc(DEFAULT_PRODUCT_IMAGE)}
      unoptimized={
        currentSrc.startsWith("data:") ||
        currentSrc.startsWith("blob:") ||
        currentSrc.startsWith("/")
      }
    />
  );
}
