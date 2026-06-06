"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarDays, Menu, Search, X } from "lucide-react";

import { GlobalSearchDropdown } from "@/components/dashboard/global-search-dropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/contexts/global-search-context";
import { useGlobalSearchResults } from "@/hooks/use-global-search-results";
import { navItems, type ModuleId } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { GlobalSearchResult } from "@/types/search";

type TopbarProps = {
  onMenu: () => void;
  activeModule: ModuleId;
  onNavigate: (module: ModuleId) => void;
};

export function Topbar({ onMenu, activeModule, onNavigate }: TopbarProps) {
  const { query, setQuery, clearQuery } = useGlobalSearch();
  const results = useGlobalSearchResults(query);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeItem = navItems.find((item) => item.id === activeModule) ?? navItems[0];
  const ActiveIcon = activeItem.icon;

  const dateLong = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date());

  const dateShort = new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date());

  const handleSelectResult = useCallback(
    (result: GlobalSearchResult) => {
      onNavigate(result.module);
      setResultsOpen(false);
      setSearchOpen(false);
    },
    [onNavigate]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setResultsOpen(value.trim().length > 0);
  };

  const handleClearQuery = () => {
    clearQuery();
    setResultsOpen(false);
  };

  useEffect(() => {
    if (searchOpen) {
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 120);
      return () => window.clearTimeout(timer);
    }
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setResultsOpen(Boolean(query.trim()));
  }, [activeModule, query]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!resultsOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current?.contains(target)) return;
      setResultsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [resultsOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setResultsOpen(false);
        setSearchOpen(false);
        return;
      }

      if (event.key === "Enter" && resultsOpen && results[0]) {
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT") {
          event.preventDefault();
          handleSelectResult(results[0]);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resultsOpen, results, handleSelectResult]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-[#050505]/88 backdrop-blur-2xl transition-shadow duration-200",
        "pt-[max(0.5rem,env(safe-area-inset-top))]",
        scrolled ? "border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.45)]" : "border-white/10"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:h-[3.75rem] lg:px-6">
        <Button
          className="size-11 shrink-0 touch-manipulation lg:hidden"
          size="icon"
          variant="secondary"
          onClick={onMenu}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:hidden">
          <AnimatePresence mode="wait" initial={false}>
            {!searchOpen ? (
              <motion.div
                key="module-context"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="flex min-w-0 flex-1 items-center gap-2.5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-racing-red/40 bg-racing-red/12 shadow-[0_0_20px_rgba(255,0,0,0.12)]">
                  <ActiveIcon className="size-[18px] text-racing-red" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[17px] font-bold leading-tight tracking-tight text-white">
                    {activeItem.label}
                  </p>
                  <p className="truncate text-[11px] font-medium capitalize text-white/42">
                    {dateShort}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="search-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="font-display text-sm font-semibold text-white/80"
              >
                Buscar en el sistema
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div ref={searchContainerRef} className="relative hidden min-w-0 flex-1 lg:block">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-white/38"
            aria-hidden
          />
          <Input
            ref={desktopSearchRef}
            className={cn(
              "h-11 max-w-2xl pl-10 pr-10",
              query && "border-racing-red/35 ring-1 ring-racing-red/20"
            )}
            placeholder="Buscar producto, cliente, reparación o venta..."
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => query.trim() && setResultsOpen(true)}
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 hover:bg-white/8 hover:text-white"
              onClick={handleClearQuery}
              aria-label="Limpiar búsqueda global"
            >
              <X className="size-4" />
            </button>
          ) : null}

          {resultsOpen && query.trim() ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-w-2xl">
              <GlobalSearchDropdown
                query={query}
                onSelect={handleSelectResult}
              />
            </div>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm text-white/64 lg:flex">
          <CalendarDays className="size-4 shrink-0 text-racing-red" aria-hidden />
          <span className="capitalize">{dateLong}</span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-1.5 lg:ml-0">
          <Button
            className={cn(
              "size-11 touch-manipulation lg:hidden",
              (searchOpen || query) && "bg-racing-red text-white shadow-glow"
            )}
            size="icon"
            variant={searchOpen || query ? "default" : "secondary"}
            onClick={() => {
              if (searchOpen) {
                setSearchOpen(false);
                setResultsOpen(false);
              } else {
                setSearchOpen(true);
              }
            }}
            aria-label={searchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </Button>

          <Button
            className="hidden size-10 md:inline-flex"
            size="icon"
            variant="secondary"
            aria-label="Notificaciones"
          >
            <Bell />
          </Button>

          <Avatar className="size-9 border border-white/12 lg:size-10">
            <AvatarFallback className="bg-gradient-to-br from-racing-red/30 to-racing-red/10 text-[11px] font-bold text-white">
              AG
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            key="mobile-search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/8 bg-[#080808]/96 lg:hidden"
          >
            <div className="space-y-2 px-3 pb-3 pt-2.5 sm:px-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40"
                  aria-hidden
                />
                <Input
                  ref={searchInputRef}
                  className="h-12 rounded-xl border-white/12 bg-white/[0.04] pl-10 pr-10 text-base"
                  placeholder="Producto, cliente, venta, taller..."
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  onFocus={() => query.trim() && setResultsOpen(true)}
                  enterKeyHint="search"
                  autoComplete="off"
                />
                {query ? (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white"
                    onClick={handleClearQuery}
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              {query.trim() ? (
                <GlobalSearchDropdown query={query} onSelect={handleSelectResult} />
              ) : (
                <p className="px-0.5 text-[11px] leading-4 text-white/38">
                  Buscá en productos, clientes, ventas, taller y proveedores.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
