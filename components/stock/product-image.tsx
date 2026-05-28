"use client";

import { useState } from "react";
import Image from "next/image";

import { DEFAULT_PRODUCT_IMAGE } from "@/lib/inventory";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, className, fill = true, sizes, priority }: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || DEFAULT_PRODUCT_IMAGE);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "(max-width: 768px) 100vw, 320px"}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setCurrentSrc(DEFAULT_PRODUCT_IMAGE)}
      unoptimized={currentSrc.startsWith("data:")}
    />
  );
}
