"use client";

import { useMemo, useState } from "react";
import {
  Grid3X3,
  LayoutList,
  Plus,
  Search
} from "lucide-react";

import { AddProductDialog } from "@/components/stock/add-product-dialog";
import { ProductCard } from "@/components/stock/product-card";
import { ProductDetailDialog } from "@/components/stock/product-detail-dialog";
import { StockStats } from "@/components/stock/stock-stats";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProductImage } from "@/components/stock/product-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/contexts/inventory-context";
import { getMarginPercent, getStockStatus } from "@/lib/inventory";
import { money } from "@/lib/utils";
import type { Product, StockStatus } from "@/types/inventory";
import { COMPATIBILITY_OPTIONS } from "@/types/inventory";

type ViewMode = "grid" | "list";

const statusFilters: Array<StockStatus | "todos"> = [
  "todos",
  "En stock",
  "Bajo stock",
  "Sin stock"
];

export function StockModule() {
  const {
    categories,
    products,
    suppliers,
    getCategoryById,
    getSubcategoryById,
    getSupplierById
  } = useInventory();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "todos">("todos");
  const [compatibilityFilter, setCompatibilityFilter] = useState<string>("todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const category = getCategoryById(product.categoryId);
      const subcategory = getSubcategoryById(product.subcategoryId);
      const supplier = getSupplierById(product.supplierId);
      const status = getStockStatus(product.stock, product.min);

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.internalCode.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        category?.name.toLowerCase().includes(query) ||
        subcategory?.name.toLowerCase().includes(query) ||
        supplier?.name.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "todos" || product.categoryId === categoryFilter;

      const matchesStatus = statusFilter === "todos" || status === statusFilter;

      const matchesCompatibility =
        compatibilityFilter === "todos" ||
        product.compatibility.includes(compatibilityFilter as (typeof COMPATIBILITY_OPTIONS)[number]);

      return matchesSearch && matchesCategory && matchesStatus && matchesCompatibility;
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
    compatibilityFilter,
    getCategoryById,
    getSubcategoryById,
    getSupplierById
  ]);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  return (
    <ModuleShell
      eyebrow="Inventario inteligente"
      title="Stock de repuestos y accesorios"
      description="Gestión de productos con precios duales, imágenes e historial. Categorías y proveedores se administran desde sus módulos dedicados."
      action={
        <AddProductDialog
          trigger={
            <Button>
              <Plus /> Agregar producto
            </Button>
          }
        />
      }
    >
      <StockStats />

      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
            <Input
              className="pl-10"
              placeholder="Buscar por nombre, código, categoría o proveedor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={viewMode === "grid" ? "default" : "secondary"}
              onClick={() => setViewMode("grid")}
              aria-label="Vista grilla"
            >
              <Grid3X3 />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "list" ? "default" : "secondary"}
              onClick={() => setViewMode("list")}
              aria-label="Vista lista"
            >
              <LayoutList />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Categoría"
            value={categoryFilter}
            options={[
              { value: "todos", label: "Todas" },
              ...categories.map((c) => ({ value: c.id, label: c.name }))
            ]}
            onChange={setCategoryFilter}
          />
          <FilterChip
            label="Estado"
            value={statusFilter}
            options={statusFilters.map((s) => ({
              value: s,
              label: s === "todos" ? "Todos" : s
            }))}
            onChange={(v) => setStatusFilter(v as StockStatus | "todos")}
          />
          <FilterChip
            label="Compatibilidad"
            value={compatibilityFilter}
            options={[
              { value: "todos", label: "Todas" },
              ...COMPATIBILITY_OPTIONS.map((c) => ({ value: c, label: c }))
            ]}
            onChange={setCompatibilityFilter}
          />
        </div>
      </Card>

      {viewMode === "grid" ? (
        filteredProducts.length === 0 ? (
          <EmptyProducts />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onView={openProductDetail} />
            ))}
          </div>
        )
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/42">
                <tr>
                  <th className="px-5 py-4">Producto</th>
                  <th className="px-5 py-4">Clasificación</th>
                  <th className="px-5 py-4">Proveedor</th>
                  <th className="px-5 py-4">Precios</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-white/48">
                      No hay productos que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const category = getCategoryById(product.categoryId);
                    const subcategory = getSubcategoryById(product.subcategoryId);
                    const supplier = getSupplierById(product.supplierId);
                    const status = getStockStatus(product.stock, product.min);
                    const margin = getMarginPercent(product.purchasePrice, product.publicPrice);

                    return (
                      <tr
                        key={product.id}
                        className="cursor-pointer transition-colors hover:bg-racing-red/[0.045]"
                        onClick={() => openProductDetail(product)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
                              <ProductImage src={product.imageUrl} alt={product.name} />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{product.name}</p>
                              <p className="text-xs text-racing-red">{product.internalCode}</p>
                              <p className="text-xs text-white/38">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-white/74">{category?.name}</p>
                          <p className="text-xs text-white/42">{subcategory?.name}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-white/64">{supplier?.name ?? "—"}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{money(product.publicPrice)}</p>
                          <p className="text-xs text-white/42">
                            Compra {money(product.purchasePrice)} · +{margin}%
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-display text-lg font-bold text-white">
                            {product.stock}
                          </span>
                          <span className="ml-2 text-xs text-white/38">mín. {product.min}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-white/36">
        {filteredProducts.length} de {products.length} productos · {suppliers.length} proveedores
      </p>

      <ProductDetailDialog
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </ModuleShell>
  );
}

function FilterChip({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-xs font-semibold text-white/40">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm font-semibold text-white focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0b0b0b]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyProducts() {
  return (
    <Card className="grid place-items-center px-6 py-16 text-center">
      <p className="font-display text-xl font-bold text-white">Sin resultados</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/48">
        Probá ajustar los filtros o agregá un producto nuevo con imagen, precios y proveedor.
      </p>
    </Card>
  );
}
