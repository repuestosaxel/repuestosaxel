"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  seedCategories,
  seedProductHistory,
  seedProducts,
  seedSubcategories,
  seedSuppliers
} from "@/data/inventory-seed";
import {
  DEFAULT_PRODUCT_IMAGE,
  formatHistoryDate,
  generateCategoryId,
  generateHistoryId,
  generateProductId,
  generateSubcategoryId,
  generateSupplierId,
  pickProductAccent
} from "@/lib/inventory";
import type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  CreateSubcategoryInput,
  CreateSupplierInput,
  Product,
  ProductHistoryEntry,
  Subcategory,
  Supplier
} from "@/types/inventory";

type ConsumeStockMeta = {
  workOrderId: string;
  detail: string;
};

type ConsumeStockResult = { ok: true } | { ok: false; error: string };

type InventoryContextValue = {
  categories: Category[];
  subcategories: Subcategory[];
  suppliers: Supplier[];
  products: Product[];
  productHistory: ProductHistoryEntry[];
  addCategory: (input: CreateCategoryInput) => Category;
  addSubcategory: (input: CreateSubcategoryInput) => Subcategory;
  addSupplier: (input: CreateSupplierInput) => Supplier;
  addProduct: (input: CreateProductInput) => Product;
  consumeProductStock: (
    productId: string,
    quantity: number,
    meta: ConsumeStockMeta
  ) => ConsumeStockResult;
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoryById: (id: string) => Subcategory | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getProductById: (id: string) => Product | undefined;
  getSubcategoriesByCategory: (categoryId: string) => Subcategory[];
  getProductHistory: (productId: string) => ProductHistoryEntry[];
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(seedSubcategories);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [productHistory, setProductHistory] = useState<ProductHistoryEntry[]>(seedProductHistory);

  const getCategoryById = useCallback(
    (id: string) => categories.find((category) => category.id === id),
    [categories]
  );

  const getSubcategoryById = useCallback(
    (id: string) => subcategories.find((subcategory) => subcategory.id === id),
    [subcategories]
  );

  const getSupplierById = useCallback(
    (id: string) => suppliers.find((supplier) => supplier.id === id),
    [suppliers]
  );

  const getProductById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products]
  );

  const getSubcategoriesByCategory = useCallback(
    (categoryId: string) => subcategories.filter((subcategory) => subcategory.categoryId === categoryId),
    [subcategories]
  );

  const getProductHistory = useCallback(
    (productId: string) =>
      productHistory
        .filter((entry) => entry.productId === productId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [productHistory]
  );

  const appendHistory = useCallback((entry: Omit<ProductHistoryEntry, "id">) => {
    setProductHistory((current) => [
      {
        ...entry,
        id: generateHistoryId(current)
      },
      ...current
    ]);
  }, []);

  const addCategory = useCallback(
    (input: CreateCategoryInput) => {
      const category: Category = {
        id: generateCategoryId(categories),
        name: input.name.trim(),
        description: input.description?.trim() || undefined
      };

      setCategories((current) => [...current, category]);
      return category;
    },
    [categories]
  );

  const addSubcategory = useCallback(
    (input: CreateSubcategoryInput) => {
      const subcategory: Subcategory = {
        id: generateSubcategoryId(subcategories),
        categoryId: input.categoryId,
        name: input.name.trim(),
        description: input.description?.trim() || undefined
      };

      setSubcategories((current) => [...current, subcategory]);
      return subcategory;
    },
    [subcategories]
  );

  const addSupplier = useCallback(
    (input: CreateSupplierInput) => {
      const supplier: Supplier = {
        id: generateSupplierId(suppliers),
        name: input.name.trim(),
        contact: input.contact?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        email: input.email?.trim() || undefined
      };

      setSuppliers((current) => [...current, supplier]);
      return supplier;
    },
    [suppliers]
  );

  const addProduct = useCallback(
    (input: CreateProductInput) => {
      const product: Product = {
        id: generateProductId(products),
        internalCode: input.internalCode.trim().toUpperCase(),
        name: input.name.trim(),
        description: input.description.trim(),
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        supplierId: input.supplierId,
        imageUrl: input.imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
        purchasePrice: input.purchasePrice,
        publicPrice: input.publicPrice,
        stock: input.stock,
        min: input.min,
        compatibility: input.compatibility,
        accent: pickProductAccent(products.length)
      };

      setProducts((current) => [...current, product]);

      appendHistory({
        productId: product.id,
        type: "creacion",
        date: formatHistoryDate(),
        detail: `Alta de producto — ${product.name}`,
        reference: product.internalCode
      });

      if (input.stock > 0) {
        appendHistory({
          productId: product.id,
          type: "ingreso_proveedor",
          date: formatHistoryDate(),
          detail: `Stock inicial de ${input.stock} unidades`,
          quantity: input.stock,
          amount: input.purchasePrice * input.stock,
          supplierId: input.supplierId
        });
      }

      return product;
    },
    [products, appendHistory]
  );

  const consumeProductStock = useCallback(
    (productId: string, quantity: number, meta: ConsumeStockMeta): ConsumeStockResult => {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return { ok: false, error: "La cantidad debe ser mayor a 0." };
      }

      const product = products.find((item) => item.id === productId);
      if (!product) {
        return { ok: false, error: "Producto no encontrado en inventario." };
      }

      if (product.stock < quantity) {
        return {
          ok: false,
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock} u.`
        };
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, stock: item.stock - quantity } : item
        )
      );

      appendHistory({
        productId,
        type: "uso_taller",
        date: formatHistoryDate(),
        detail: meta.detail,
        quantity: -quantity,
        amount: product.publicPrice * quantity,
        reference: meta.workOrderId
      });

      return { ok: true };
    },
    [products, appendHistory]
  );

  const value = useMemo(
    () => ({
      categories,
      subcategories,
      suppliers,
      products,
      productHistory,
      addCategory,
      addSubcategory,
      addSupplier,
      addProduct,
      consumeProductStock,
      getCategoryById,
      getSubcategoryById,
      getSupplierById,
      getProductById,
      getSubcategoriesByCategory,
      getProductHistory
    }),
    [
      categories,
      subcategories,
      suppliers,
      products,
      productHistory,
      addCategory,
      addSubcategory,
      addSupplier,
      addProduct,
      consumeProductStock,
      getCategoryById,
      getSubcategoryById,
      getSupplierById,
      getProductById,
      getSubcategoriesByCategory,
      getProductHistory
    ]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error("useInventory debe usarse dentro de InventoryProvider");
  }

  return context;
}
