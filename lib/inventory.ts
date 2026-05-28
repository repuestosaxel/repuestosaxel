import type { Product, StockStatus } from "@/types/inventory";

const PRODUCT_ACCENTS = [
  "from-red-600 to-zinc-900",
  "from-white/70 to-red-700",
  "from-red-700 to-neutral-800",
  "from-zinc-700 to-red-800",
  "from-neutral-700 to-neutral-950",
  "from-red-500 to-neutral-900"
] as const;

export const DEFAULT_PRODUCT_IMAGE = "/products/placeholder.svg";

export function getStockStatus(stock: number, min: number): StockStatus {
  if (stock <= 0) return "Sin stock";
  if (stock <= min) return "Bajo stock";
  return "En stock";
}

export function getMarginPercent(purchasePrice: number, publicPrice: number): number {
  if (purchasePrice <= 0) return 0;
  return Math.round(((publicPrice - purchasePrice) / purchasePrice) * 100);
}

export function generateProductId(products: Product[]): string {
  const maxId = products.reduce((max, product) => {
    const numeric = Number(product.id.split("-")[1]);
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 1000);

  return `P-${maxId + 1}`;
}

export function generateCategoryId(categories: { id: string }[]): string {
  const maxId = categories.reduce((max, category) => {
    const numeric = Number(category.id.replace("CAT-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 100);

  return `CAT-${maxId + 1}`;
}

export function generateSubcategoryId(subcategories: { id: string }[]): string {
  const maxId = subcategories.reduce((max, subcategory) => {
    const numeric = Number(subcategory.id.replace("SUB-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 100);

  return `SUB-${maxId + 1}`;
}

export function generateSupplierId(suppliers: { id: string }[]): string {
  const maxId = suppliers.reduce((max, supplier) => {
    const numeric = Number(supplier.id.replace("SUP-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 100);

  return `SUP-${maxId + 1}`;
}

export function generateHistoryId(entries: { id: string }[]): string {
  const maxId = entries.reduce((max, entry) => {
    const numeric = Number(entry.id.replace("H-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 1000);

  return `H-${maxId + 1}`;
}

export function pickProductAccent(index: number): string {
  return PRODUCT_ACCENTS[index % PRODUCT_ACCENTS.length];
}

export function formatHistoryDate(date = new Date()): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
