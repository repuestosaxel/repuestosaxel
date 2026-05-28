"use client";

import { Eye } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProductImage } from "@/components/stock/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInventory } from "@/contexts/inventory-context";
import { getMarginPercent, getStockStatus } from "@/lib/inventory";
import { money } from "@/lib/utils";
import type { Product } from "@/types/inventory";

type ProductCardProps = {
  product: Product;
  onView: (product: Product) => void;
};

export function ProductCard({ product, onView }: ProductCardProps) {
  const { getCategoryById, getSubcategoryById, getSupplierById } = useInventory();
  const category = getCategoryById(product.categoryId);
  const subcategory = getSubcategoryById(product.subcategoryId);
  const supplier = getSupplierById(product.supplierId);
  const status = getStockStatus(product.stock, product.min);
  const margin = getMarginPercent(product.purchasePrice, product.publicPrice);

  return (
    <Card className="group overflow-hidden transition-all hover:border-racing-red/45 hover:shadow-glow">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-black/30">
        <ProductImage src={product.imageUrl} alt={product.name} />
        <div className="absolute left-3 top-3">
          <StatusBadge status={status} />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
          <p className="font-display text-xs font-bold text-racing-red">{product.internalCode}</p>
          <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold leading-tight text-white">
            {product.name}
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-1.5">
          {product.compatibility.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Meta label="Categoría" value={category?.name ?? "—"} />
          <Meta label="Subcategoría" value={subcategory?.name ?? "—"} />
          <Meta label="Proveedor" value={supplier?.name ?? "—"} />
          <Meta label="Stock" value={`${product.stock} u.`} />
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-white/8 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/38">Público</p>
            <p className="font-display text-xl font-bold text-white">{money(product.publicPrice)}</p>
            <p className="text-xs text-white/42">
              Compra {money(product.purchasePrice)} · +{margin}%
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => onView(product)}>
            <Eye /> Ver
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
      <p className="text-white/38">{label}</p>
      <p className="mt-0.5 truncate font-semibold text-white/72">{value}</p>
    </div>
  );
}
