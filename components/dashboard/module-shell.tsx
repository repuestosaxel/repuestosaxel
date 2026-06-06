import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ModuleShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ModuleShell({ eyebrow, title, description, action, children }: ModuleShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 p-4 sm:gap-6 lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-racing-red sm:text-xs sm:tracking-[0.28em]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56 sm:text-[15px] md:text-base">
            {description}
          </p>
        </div>
        {action ? (
          <div className={cn("shrink-0 md:pt-1", "[&_button]:w-full sm:[&_button]:w-auto")}>
            {action}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
