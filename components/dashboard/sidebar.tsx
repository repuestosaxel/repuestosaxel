"use client";

import { X } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { navItems, type ModuleId } from "@/data/mock-data";
import { cn } from "@/lib/utils";

type SidebarProps = {
  active: ModuleId;
  onChange: (module: ModuleId) => void;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ active, onChange, open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#070707]/92 p-4 shadow-panel backdrop-blur-2xl transition-transform lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo />
          <Button className="lg:hidden" size="icon" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return (
              <button
                key={item.id}
                className={cn(
                  "group flex h-12 items-center gap-3 rounded-xl border px-3 text-left text-sm font-semibold transition-all",
                  selected
                    ? "border-racing-red/55 bg-racing-red/16 text-white shadow-glow"
                    : "border-transparent text-white/58 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                )}
                onClick={() => {
                  onChange(item.id);
                  onClose();
                }}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors",
                    selected ? "bg-racing-red text-white" : "bg-white/[0.06] text-white/54 group-hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="rounded-xl border border-racing-red/25 bg-racing-red/10 p-4">
          <p className="font-display text-sm font-bold">Modo demo comercial</p>
          <p className="mt-1 text-xs leading-5 text-white/56">
            Datos hardcodeados para presentar flujo, diseño y valor del producto.
          </p>
        </div>
      </aside>
    </>
  );
}
