export type StockStatus = "En stock" | "Bajo stock" | "Sin stock";

export type CompatibilityType = "Motocicletas" | "2 tiempos" | "4 tiempos";

export type ProductHistoryType =
  | "ingreso_proveedor"
  | "uso_taller"
  | "venta"
  | "ajuste_stock"
  | "creacion";

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type Subcategory = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
};

export type Product = {
  id: string;
  internalCode: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  supplierId: string;
  imageUrl: string;
  purchasePrice: number;
  publicPrice: number;
  stock: number;
  min: number;
  compatibility: CompatibilityType[];
  accent: string;
};

export type ProductHistoryEntry = {
  id: string;
  productId: string;
  type: ProductHistoryType;
  date: string;
  detail: string;
  quantity?: number;
  amount?: number;
  supplierId?: string;
  reference?: string;
};

export type InventorySnapshot = {
  categories: Category[];
  subcategories: Subcategory[];
  suppliers: Supplier[];
  products: Product[];
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
};

export type CreateSubcategoryInput = {
  categoryId: string;
  name: string;
  description?: string;
};

export type CreateSupplierInput = {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
};

export type CreateProductInput = {
  internalCode: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  supplierId: string;
  imageUrl: string;
  purchasePrice: number;
  publicPrice: number;
  stock: number;
  min: number;
  compatibility: CompatibilityType[];
};

export type UpdateProductInput = {
  internalCode?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  supplierId?: string;
  imageUrl?: string;
  purchasePrice?: number;
  publicPrice?: number;
  stock?: number;
  min?: number;
  compatibility?: CompatibilityType[];
};

export const COMPATIBILITY_OPTIONS: CompatibilityType[] = [
  "Motocicletas",
  "2 tiempos",
  "4 tiempos"
];

export const HISTORY_TYPE_LABELS: Record<ProductHistoryType, string> = {
  ingreso_proveedor: "Ingreso por proveedor",
  uso_taller: "Uso en taller",
  venta: "Venta",
  ajuste_stock: "Ajuste de stock",
  creacion: "Alta de producto"
};
