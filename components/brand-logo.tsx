import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md" | "lg" | "hero";

type BrandLogoProps = {
  compact?: boolean;
  size?: BrandLogoSize;
  className?: string;
  centered?: boolean;
};

const sizeStyles: Record<
  BrandLogoSize,
  { image: string; title: string; subtitle: string; gap: string }
> = {
  sm: {
    image: "h-8 w-[4.75rem]",
    title: "text-sm",
    subtitle: "text-[11px]",
    gap: "gap-2.5"
  },
  md: {
    image: "h-11 w-[6.5rem]",
    title: "text-base",
    subtitle: "text-xs",
    gap: "gap-3"
  },
  lg: {
    image: "h-12 w-full max-w-[13rem]",
    title: "text-base",
    subtitle: "text-xs",
    gap: "gap-3"
  },
  hero: {
    image: "h-[4.5rem] w-[14rem] sm:h-24 sm:w-[17rem] lg:h-28 lg:w-[20rem]",
    title: "text-3xl sm:text-4xl lg:text-[2.75rem]",
    subtitle: "text-base sm:text-lg",
    gap: "gap-5 sm:gap-6"
  }
};

export function BrandLogo({
  compact = false,
  size,
  className,
  centered = false
}: BrandLogoProps) {
  const resolvedSize: BrandLogoSize = size ?? (compact ? "sm" : "md");
  const styles = sizeStyles[resolvedSize];

  return (
    <div
      className={cn(
        "flex items-center",
        styles.gap,
        centered && "flex-col text-center sm:flex-row sm:text-left",
        className
      )}
    >
      <div className={cn("relative shrink-0", styles.image)}>
        <Image
          src="/ayg.png"
          alt="AYG Motor Racing"
          width={320}
          height={150}
          className="h-full w-full object-contain object-left"
          priority
        />
      </div>
      {!compact && (
        <div className={cn("min-w-0", centered && "sm:min-w-0")}>
          <p
            className={cn(
              "font-display font-bold leading-[1.05] tracking-tight text-white",
              styles.title
            )}
          >
            AYG Motor Racing
          </p>
          <p className={cn("mt-1.5 font-semibold text-racing-red", styles.subtitle)}>
            Repuestos & Taller
          </p>
        </div>
      )}
    </div>
  );
}
