"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type LoginBrandShowcaseProps = {
  variant?: "mobile" | "desktop";
  className?: string;
};

export function LoginBrandShowcase({
  variant = "mobile",
  className
}: LoginBrandShowcaseProps) {
  const isDesktop = variant === "desktop";

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        isDesktop ? "items-start text-left" : "items-center text-center",
        className
      )}
    >
      <div
        className={cn(
          "relative w-full",
          isDesktop ? "max-w-[32rem]" : "max-w-[min(100%,28rem)]"
        )}
      >
        <div
          className={cn(
            "absolute -inset-3 rounded-[1.75rem] bg-racing-red/20 blur-2xl",
            isDesktop ? "opacity-70" : "opacity-50"
          )}
          aria-hidden
        />
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/12 bg-black/50 shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
            isDesktop ? "p-7 sm:p-8" : "p-6 sm:p-7"
          )}
        >
          <Image
            src="/ayg.png"
            alt="Logo AYG Motor Racing"
            width={640}
            height={300}
            priority
            className={cn(
              "mx-auto h-auto w-full object-contain",
              isDesktop ? "max-h-[10rem] xl:max-h-[11rem]" : "max-h-[9rem] sm:max-h-[10rem]"
            )}
          />
        </div>
      </div>

      {isDesktop ? (
        <p className="mt-4 text-sm font-semibold text-racing-red">Repuestos & Taller</p>
      ) : (
        <div className="mt-6 w-full max-w-[24rem]">
          <h1 className="font-display text-[2rem] font-bold leading-[1.02] tracking-tight text-white sm:text-[2.35rem]">
            AYG Motor Racing
          </h1>
          <p className="mt-2 text-base font-semibold text-racing-red">Repuestos & Taller</p>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Gestión integral de stock, ventas y taller.
          </p>
        </div>
      )}
    </div>
  );
}
