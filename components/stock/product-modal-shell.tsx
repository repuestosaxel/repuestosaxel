"use client";

import type { FormEvent, ReactNode } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ProductModalShellProps = {
  title: string;
  description?: string;
  sidebar: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProductModalShell({
  title,
  description,
  sidebar,
  children,
  footer,
  className,
  onSubmit
}: ProductModalShellProps) {
  const body = (
    <div className="max-h-[min(92dvh,92vh)] overflow-y-auto overscroll-contain lg:flex lg:max-h-[92vh] lg:overflow-hidden">
        <aside className="w-full shrink-0 border-b border-white/10 bg-white/[0.03] lg:w-[360px] lg:border-b-0 lg:border-r">
          <div className="p-5">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="pr-10 font-display text-xl font-black sm:text-2xl">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="text-white/45">{description}</DialogDescription>
              ) : null}
            </DialogHeader>
            <div className="mt-5">{sidebar}</div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
          <div className="space-y-8 p-5 lg:flex-1 lg:overflow-y-auto lg:p-7">{children}</div>
          {footer ? (
            <div className="border-t border-white/10 bg-[#060606]/95 p-4 backdrop-blur-sm lg:shrink-0 lg:px-7 lg:pb-7">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
  );

  return (
    <DialogContent
      className={cn(
        "gap-0 overflow-hidden border-white/10 bg-[#060606] p-0 text-white",
        "w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-2xl lg:max-w-6xl",
        className
      )}
    >
      {onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}
    </DialogContent>
  );
}

export function ModalSection({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">{title}</p>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ModalField({
  label,
  htmlFor,
  children,
  className
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-white/68">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ModalInfoBlock({
  label,
  value,
  sub
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 font-display text-sm font-bold text-white">{value}</p>
      {sub ? (
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-racing-red">{sub}</p>
      ) : null}
    </div>
  );
}

export function ModalPriceBlock({
  label,
  value,
  sub,
  tone = "muted"
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "muted" | "accent" | "success";
}) {
  const toneClass =
    tone === "accent" ? "text-racing-red" : tone === "success" ? "text-emerald-300" : "text-white";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className={cn("mt-1 font-display text-lg font-bold", toneClass)}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-white/42">{sub}</p> : null}
    </div>
  );
}
