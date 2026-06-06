"use client";

import { Grid3X3, LayoutList, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COMPATIBILITY_OPTIONS } from "@/types/inventory";
import type { Category, StockStatus } from "@/types/inventory";

type ViewMode = "grid" | "list";

type StockFiltersPanelProps = {
  search: string;
  onSearchChange: (value: string) => void;
  isGlobalSearch?: boolean;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: StockStatus | "todos";
  onStatusFilterChange: (value: StockStatus | "todos") => void;
  compatibilityFilter: string;
  onCompatibilityFilterChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  categories: Category[];
  resultCount: number;
  totalCount: number;
  onClearAll?: () => void;
};

const statusFilters: Array<StockStatus | "todos"> = [
  "todos",
  "En stock",
  "Bajo stock",
  "Sin stock"
];

export function StockFiltersPanel({
  search,
  onSearchChange,
  isGlobalSearch = false,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  compatibilityFilter,
  onCompatibilityFilterChange,
  viewMode,
  onViewModeChange,
  categories,
  resultCount,
  totalCount,
  onClearAll
}: StockFiltersPanelProps) {
  const hasActiveFilters =
    search.trim().length > 0 ||
    categoryFilter !== "todos" ||
    statusFilter !== "todos" ||
    compatibilityFilter !== "todos";

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36"
              aria-hidden
            />
            <Input
              className={cn(
                "h-10 rounded-lg border-white/10 bg-white/[0.04] pl-9 pr-9 text-sm",
                isGlobalSearch && "border-racing-red/35 ring-1 ring-racing-red/20"
              )}
              placeholder="Buscar producto, código..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            {search ? (
              <button
                type="button"
                className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-white/45 hover:bg-white/8 hover:text-white"
                onClick={() => onSearchChange("")}
                aria-label="Limpiar búsqueda"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="inline-flex shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            <ViewButton
              active={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              label="Grilla"
              icon={Grid3X3}
            />
            <ViewButton
              active={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              label="Lista"
              icon={LayoutList}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 sm:flex sm:items-center">
          <CompactSelect
            label="Estado"
            value={statusFilter}
            onChange={(value) => onStatusFilterChange(value as StockStatus | "todos")}
            options={statusFilters.map((status) => ({
              value: status,
              label: status === "todos" ? "Todos" : status
            }))}
          />
          <CompactSelect
            label="Categoría"
            value={categoryFilter}
            onChange={onCategoryFilterChange}
            options={[
              { value: "todos", label: "Todas" },
              ...categories.map((c) => ({ value: c.id, label: c.name }))
            ]}
          />
          <CompactSelect
            label="Compat."
            value={compatibilityFilter}
            onChange={onCompatibilityFilterChange}
            options={[
              { value: "todos", label: "Todas" },
              ...COMPATIBILITY_OPTIONS.map((c) => ({ value: c, label: c }))
            ]}
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-white/40">
          <span>
            <span className="font-bold text-white">{resultCount}</span> de {totalCount} productos
            {isGlobalSearch ? (
              <span className="ml-1.5 text-racing-red">· búsqueda global</span>
            ) : null}
          </span>
          {hasActiveFilters && onClearAll ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={onClearAll}
            >
              <X className="size-3.5" />
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  icon: Icon
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: typeof Grid3X3;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-all sm:w-auto sm:gap-1.5 sm:px-2.5",
        active ? "bg-racing-red text-white shadow-glow" : "text-white/50 hover:text-white"
      )}
      aria-label={label}
      aria-pressed={active}
    >
      <Icon className="size-3.5" />
      <span className="hidden text-xs font-semibold sm:inline">{label}</span>
    </button>
  );
}

function CompactSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="inline-flex h-9 w-full items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 sm:max-w-[11rem] sm:flex-none">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-white/35">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 cursor-pointer truncate bg-transparent text-xs font-semibold text-white focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0b0b0b]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
