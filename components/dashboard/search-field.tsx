"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function SearchField({ value, onChange, placeholder, className }: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/38"
        aria-hidden
      />
      <Input
        className="h-12 rounded-xl border-white/12 bg-white/[0.04] pl-10 pr-10 text-base sm:h-11 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
