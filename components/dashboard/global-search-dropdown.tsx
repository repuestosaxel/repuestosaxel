"use client";

import {
  Boxes,
  ClipboardCheck,
  Layers2,
  ReceiptText,
  Search,
  Truck,
  Users
} from "lucide-react";

import { useGlobalSearchResults } from "@/hooks/use-global-search-results";
import type { ModuleId } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { GlobalSearchResult, GlobalSearchResultType } from "@/types/search";

type GlobalSearchDropdownProps = {
  query: string;
  onSelect: (result: GlobalSearchResult) => void;
  className?: string;
};

const typeLabels: Record<GlobalSearchResultType, string> = {
  product: "Producto",
  customer: "Cliente",
  sale: "Venta",
  "work-order": "Taller",
  supplier: "Proveedor",
  category: "Categoría"
};

const typeIcons: Record<GlobalSearchResultType, typeof Boxes> = {
  product: Boxes,
  customer: Users,
  sale: ReceiptText,
  "work-order": ClipboardCheck,
  supplier: Truck,
  category: Layers2
};

const moduleLabels: Record<ModuleId, string> = {
  dashboard: "Dashboard",
  stock: "Stock",
  categorias: "Categorías",
  proveedores: "Proveedores",
  ventas: "Ventas",
  clientes: "Clientes",
  taller: "Taller",
  finanzas: "Finanzas",
  reportes: "Reportes",
  configuracion: "Configuración"
};

export function GlobalSearchDropdown({ query, onSelect, className }: GlobalSearchDropdownProps) {
  const results = useGlobalSearchResults(query);
  const trimmed = query.trim();

  if (!trimmed) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/12 bg-[#0a0a0a]/98 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl",
        className
      )}
    >
      {results.length === 0 ? (
        <div className="flex items-start gap-3 px-4 py-4 text-sm text-white/50">
          <Search className="mt-0.5 size-4 shrink-0 text-white/30" />
          <div>
            <p className="font-medium text-white/72">Sin coincidencias</p>
            <p className="mt-1 text-xs leading-5 text-white/40">
              Probá con nombre de producto, cliente, venta u orden de taller.
            </p>
          </div>
        </div>
      ) : (
        <ul className="max-h-[min(22rem,50vh)] overflow-y-auto py-1">
          {results.map((result) => {
            const Icon = typeIcons[result.type];
            return (
              <li key={`${result.type}-${result.id}`}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-racing-red/10"
                  onClick={() => onSelect(result)}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    <Icon className="size-4 text-racing-red" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">
                      {result.title}
                    </span>
                    <span className="block truncate text-xs text-white/45">{result.subtitle}</span>
                  </span>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-white/30">
                    {moduleLabels[result.module]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="border-t border-white/8 px-4 py-2 text-[11px] text-white/35">
        {results.length > 0
          ? `${results.length} resultado${results.length === 1 ? "" : "s"} · Enter para ir al primero`
          : "Búsqueda en productos, clientes, ventas y taller"}
      </div>
    </div>
  );
}
