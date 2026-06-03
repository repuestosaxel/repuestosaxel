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
import { getSaleLineSubtotal } from "@/lib/sales";
import type { CreateSaleInput, Sale, SaleLineItem, SaleStatus } from "@/types/sales";

type SalesContextValue = {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSale: (input: CreateSaleInput) => Promise<Sale>;
  updateSaleStatus: (id: string, status: SaleStatus) => Promise<Sale | undefined>;
  getSaleById: (id: string) => Sale | undefined;
  getSalesByCustomer: (customerId: string) => Sale[];
};

const SalesContext = createContext<SalesContextValue | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<Sale[]>("/api/sales");
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las ventas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getSaleById = useCallback((id: string) => sales.find((sale) => sale.id === id), [sales]);

  const getSalesByCustomer = useCallback(
    (customerId: string) =>
      sales
        .filter((sale) => sale.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sales]
  );

  const createSale = useCallback(async (input: CreateSaleInput) => {
    const sale = await api.post<Sale>("/api/sales", input);
    setSales((current) => [sale, ...current]);
    return sale;
  }, []);

  const updateSaleStatus = useCallback(async (id: string, status: SaleStatus) => {
    const sale = await api.patch<Sale>(`/api/sales/${id}`, { status });
    setSales((current) => current.map((item) => (item.id === id ? sale : item)));
    return sale;
  }, []);

  const value = useMemo(
    () => ({
      sales,
      loading,
      error,
      refresh,
      createSale,
      updateSaleStatus,
      getSaleById,
      getSalesByCustomer
    }),
    [sales, loading, error, refresh, createSale, updateSaleStatus, getSaleById, getSalesByCustomer]
  );

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales() {
  const context = useContext(SalesContext);

  if (!context) {
    throw new Error("useSales debe usarse dentro de SalesProvider");
  }

  return context;
}

export function buildSaleLineItems(
  entries: {
    productId: string;
    quantity: number;
  }[]
): CreateSaleInput["items"] {
  return entries.map((entry) => ({
    productId: entry.productId,
    quantity: entry.quantity
  }));
}

export function buildCartLineItems(
  existingItems: SaleLineItem[],
  entries: {
    productId: string;
    productName: string;
    internalCode: string;
    quantity: number;
    unitPrice: number;
  }[]
): SaleLineItem[] {
  return entries.map((entry, index) => ({
    id: `line-${index}`,
    productId: entry.productId,
    productName: entry.productName,
    internalCode: entry.internalCode,
    quantity: entry.quantity,
    unitPrice: entry.unitPrice,
    subtotal: getSaleLineSubtotal(entry.quantity, entry.unitPrice)
  }));
}
