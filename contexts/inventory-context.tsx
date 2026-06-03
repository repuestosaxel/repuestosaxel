"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { api } from "@/lib/api/client";
import type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  CreateSubcategoryInput,
  CreateSupplierInput,
  InventorySnapshot,
  Product,
  ProductHistoryEntry,
  Subcategory,
  Supplier,
  UpdateProductInput
} from "@/types/inventory";

type InventoryContextValue = {
  categories: Category[];
  subcategories: Subcategory[];
  suppliers: Supplier[];
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<Category>;
  addSubcategory: (input: CreateSubcategoryInput) => Promise<Subcategory>;
  addSupplier: (input: CreateSupplierInput) => Promise<Supplier>;
  addProduct: (input: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, input: UpdateProductInput) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<boolean>;
  fetchProductHistory: (productId: string) => Promise<ProductHistoryEntry[]>;
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoryById: (id: string) => Subcategory | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getProductById: (id: string) => Product | undefined;
  getSubcategoriesByCategory: (categoryId: string) => Subcategory[];
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySnapshot = useCallback((snapshot: InventorySnapshot) => {
    setCategories(snapshot.categories);
    setSubcategories(snapshot.subcategories);
    setSuppliers(snapshot.suppliers);
    setProducts(snapshot.products);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const snapshot = await api.get<InventorySnapshot>("/api/inventory");
      applySnapshot(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, [applySnapshot]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  const addCategory = useCallback(async (input: CreateCategoryInput) => {
    const category = await api.post<Category>("/api/categories", input);
    setCategories((current) => [...current, category]);
    return category;
  }, []);

  const addSubcategory = useCallback(async (input: CreateSubcategoryInput) => {
    const subcategory = await api.post<Subcategory>("/api/subcategories", input);
    setSubcategories((current) => [...current, subcategory]);
    return subcategory;
  }, []);

  const addSupplier = useCallback(async (input: CreateSupplierInput) => {
    const supplier = await api.post<Supplier>("/api/suppliers", input);
    setSuppliers((current) => [...current, supplier]);
    return supplier;
  }, []);

  const addProduct = useCallback(async (input: CreateProductInput) => {
    const product = await api.post<Product>("/api/products", input);
    setProducts((current) => [...current, product]);
    return product;
  }, []);

  const updateProduct = useCallback(async (id: string, input: UpdateProductInput) => {
    const product = await api.patch<Product>(`/api/products/${id}`, input);
    setProducts((current) => current.map((item) => (item.id === id ? product : item)));
    return product;
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await api.delete<{ id: string }>(`/api/products/${id}`);
    setProducts((current) => current.filter((item) => item.id !== id));
    return true;
  }, []);

  const fetchProductHistory = useCallback(async (productId: string) => {
    return api.get<ProductHistoryEntry[]>(`/api/products/${productId}/history`);
  }, []);

  const value = useMemo(
    () => ({
      categories,
      subcategories,
      suppliers,
      products,
      loading,
      error,
      refresh,
      addCategory,
      addSubcategory,
      addSupplier,
      addProduct,
      updateProduct,
      deleteProduct,
      fetchProductHistory,
      getCategoryById,
      getSubcategoryById,
      getSupplierById,
      getProductById,
      getSubcategoriesByCategory
    }),
    [
      categories,
      subcategories,
      suppliers,
      products,
      loading,
      error,
      refresh,
      addCategory,
      addSubcategory,
      addSupplier,
      addProduct,
      updateProduct,
      deleteProduct,
      fetchProductHistory,
      getCategoryById,
      getSubcategoryById,
      getSupplierById,
      getProductById,
      getSubcategoriesByCategory
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
