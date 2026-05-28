"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  Package,
  ShoppingCart,
  Truck,
  Wrench
} from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProductImage } from "@/components/stock/product-image";
import {
  ModalInfoBlock,
  ModalPriceBlock,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useInventory } from "@/contexts/inventory-context";
import { getMarginPercent, getStockStatus } from "@/lib/inventory";
import { money } from "@/lib/utils";
import type { Product, ProductHistoryType } from "@/types/inventory";
import { HISTORY_TYPE_LABELS } from "@/types/inventory";

type ProductDetailDialogProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const historyIcons: Record<ProductHistoryType, typeof Truck> = {
  ingreso_proveedor: Truck,
  uso_taller: Wrench,
  venta: ShoppingCart,
  ajuste_stock: ClipboardList,
  creacion: Package
};

const historyColors: Record<ProductHistoryType, string> = {
  ingreso_proveedor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  uso_taller: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  venta: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  ajuste_stock: "border-white/20 bg-white/5 text-white/70",
  creacion: "border-racing-red/30 bg-racing-red/10 text-red-100"
};

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const {
    getCategoryById,
    getSubcategoryById,
    getSupplierById,
    getProductHistory
  } = useInventory();

  if (!product) return null;

  const category = getCategoryById(product.categoryId);
  const subcategory = getSubcategoryById(product.subcategoryId);
  const supplier = getSupplierById(product.supplierId);
  const history = getProductHistory(product.id);
  const status = getStockStatus(product.stock, product.min);
  const margin = getMarginPercent(product.purchasePrice, product.publicPrice);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ProductModalShell
        title={product.name}
        description={`${product.internalCode} · ${product.id}`}
        sidebar={
          <>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <div className="relative aspect-square">
                <ProductImage src={product.imageUrl} alt={product.name} priority />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Estado</p>
              <div className="mt-3">
                <StatusBadge status={status} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Stock actual</span>
                  <span className="font-bold text-white">{product.stock}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Stock mínimo</span>
                  <span className="font-bold text-white">{product.min}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Margen</span>
                  <span className="font-bold text-emerald-300">{margin}%</span>
                </div>
              </div>
            </div>
          </>
        }
      >
        <ModalSection title="Descripción">
          <p className="text-sm leading-7 text-white/70">{product.description}</p>
        </ModalSection>

        <ModalSection title="Información">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ModalInfoBlock label="Categoría" value={category?.name ?? "—"} sub={category?.id} />
            <ModalInfoBlock
              label="Subcategoría"
              value={subcategory?.name ?? "—"}
              sub={subcategory?.id}
            />
            <ModalInfoBlock label="Proveedor" value={supplier?.name ?? "—"} sub={supplier?.id} />
            <ModalInfoBlock label="Compatibilidad" value={product.compatibility.join(" · ")} />
          </div>
        </ModalSection>

        <ModalSection title="Precios">
          <div className="grid gap-3 sm:grid-cols-3">
            <ModalPriceBlock
              label="Precio compra"
              value={money(product.purchasePrice)}
              tone="muted"
            />
            <ModalPriceBlock
              label="Precio público"
              value={money(product.publicPrice)}
              tone="accent"
            />
            <ModalPriceBlock
              label="Margen"
              value={`${margin}%`}
              sub={`Ganancia ${money(product.publicPrice - product.purchasePrice)}`}
              tone="success"
            />
          </div>
        </ModalSection>

        <ModalSection
          title="Historial del producto"
          action={<Badge variant="outline">{history.length} movimientos</Badge>}
        >
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/40">
                Sin movimientos registrados.
              </div>
            ) : (
              history.map((entry) => {
                const Icon = historyIcons[entry.type];
                const supplierEntry = entry.supplierId
                  ? getSupplierById(entry.supplierId)
                  : undefined;

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${historyColors[entry.type]}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-sm font-bold text-white">
                            {HISTORY_TYPE_LABELS[entry.type]}
                          </p>
                          {entry.reference ? (
                            <Badge variant="outline">{entry.reference}</Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/60">{entry.detail}</p>
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                          <span>{entry.date}</span>
                          {entry.quantity !== undefined ? (
                            <span className="inline-flex items-center gap-1">
                              {entry.quantity >= 0 ? (
                                <ArrowDownLeft className="size-3 text-emerald-400" />
                              ) : (
                                <ArrowUpRight className="size-3 text-amber-400" />
                              )}
                              {Math.abs(entry.quantity)} u.
                            </span>
                          ) : null}
                          {entry.amount !== undefined ? <span>{money(entry.amount)}</span> : null}
                          {supplierEntry ? <span>{supplierEntry.name}</span> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ModalSection>
      </ProductModalShell>
    </Dialog>
  );
}
