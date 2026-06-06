"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { AddProductDialog } from "@/components/stock/add-product-dialog";
import { ProductCard } from "@/components/stock/product-card";
import { ProductDetailDialog } from "@/components/stock/product-detail-dialog";
import { StockFiltersPanel } from "@/components/stock/stock-filters-panel";
import { StockStats } from "@/components/stock/stock-stats";
import { ModuleDataGate, StockModuleSkeleton } from "@/components/dashboard/data-loading";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProductImage } from "@/components/stock/product-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInventory } from "@/contexts/inventory-context";
import { useEffectiveSearch } from "@/hooks/use-effective-search";
import { getMarginPercent, getStockStatus } from "@/lib/inventory";
import { money } from "@/lib/utils";
import type { Product, StockStatus } from "@/types/inventory";
import { COMPATIBILITY_OPTIONS } from "@/types/inventory";

type ViewMode = "grid" | "list";

export function StockModule() {
  const {
    categories,
    products,
    suppliers,
    loading,
    error,
    refresh,
    getCategoryById,
    getSubcategoryById,
    getSupplierById,
    getProductById
  } = useInventory();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const {
    effectiveQuery,
    searchFieldValue,
    onSearchFieldChange,
    clearSearch,
    isGlobalActive
  } = useEffectiveSearch(search, setSearch);
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "todos">("todos");
  const [compatibilityFilter, setCompatibilityFilter] = useState<string>("todos");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = effectiveQuery;

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
    effectiveQuery,
    categoryFilter,
    statusFilter,
    compatibilityFilter,
    getCategoryById,
    getSubcategoryById,
    getSupplierById
  ]);

  const openProductDetail = (product: Product) => {
    setSelectedProductId(product.id);
    setDetailOpen(true);
  };

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) ?? null : null;

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
      <ModuleDataGate
        loading={loading}
        error={error}
        onRetry={refresh}
        skeleton={<StockModuleSkeleton />}
      >
      <StockStats />

      <StockFiltersPanel
        search={searchFieldValue}
        onSearchChange={onSearchFieldChange}
        isGlobalSearch={isGlobalActive}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        compatibilityFilter={compatibilityFilter}
        onCompatibilityFilterChange={setCompatibilityFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
        resultCount={filteredProducts.length}
        totalCount={products.length}
        onClearAll={() => {
          clearSearch();
          setCategoryFilter("todos");
          setStatusFilter("todos");
          setCompatibilityFilter("todos");
        }}
      />

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
        {suppliers.length} proveedores en el sistema
      </p>

      <ProductDetailDialog
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDeleted={() => setSelectedProductId(null)}
      />
      </ModuleDataGate>
    </ModuleShell>
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
