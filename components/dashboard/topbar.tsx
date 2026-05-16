"use client";

import { Bell, CalendarDays, Menu, Search } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TopbarProps = {
  onMenu: () => void;
};

export function Topbar({ onMenu }: TopbarProps) {
  const date = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/72 px-4 py-3 backdrop-blur-2xl lg:px-6">
      <div className="flex items-center gap-3">
        <Button className="lg:hidden" size="icon" variant="secondary" onClick={onMenu}>
          <Menu />
        </Button>
        <BrandLogo className="sm:hidden" compact />

        <div className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/38" />
          <Input
            className="h-11 max-w-xl pl-10"
            placeholder="Buscar producto, cliente, reparación o venta..."
          />
        </div>

        <div className="ml-auto hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/64 md:flex">
          <CalendarDays className="size-4 text-racing-red" />
          <span className="capitalize">{date}</span>
        </div>

        <Button size="icon" variant="secondary" aria-label="Notificaciones">
          <Bell />
        </Button>
        <Avatar>
          <AvatarFallback>AG</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
