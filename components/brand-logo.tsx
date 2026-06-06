import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="">
        <Image
          src="/ayg.png"
          alt="AYG Motor Racing"
          width={90}
          height={42}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-none text-white">AYG Motor Racing</p>
          <p className="mt-1 text-xs font-medium text-racing-red">Repuestos & Taller</p>
        </div>
      )}
    </div>
  );
}
