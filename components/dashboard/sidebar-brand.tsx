import Image from "next/image";

import { cn } from "@/lib/utils";

type SidebarBrandProps = {
  className?: string;
};

export function SidebarBrand({ className }: SidebarBrandProps) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
        <div className="relative h-16 w-full sm:h-[6rem]">
          <Image
            src="/ayg.png"
            alt="AYG Motor Racing"
            width={480}
            height={220}
            className="h-full w-full object-contain object-left"
            priority
          />
        </div>
        <p className="mt-2 text-[11px] font-semibold tracking-wide text-racing-red">
          Repuestos & Taller
        </p>
      </div>
    </div>
  );
}
