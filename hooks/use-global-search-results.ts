"use client";

import { useMemo } from "react";

import { useCrm } from "@/contexts/crm-context";
import { useInventory } from "@/contexts/inventory-context";
import { useSales } from "@/contexts/sales-context";
import { getSaleItemsSummary } from "@/lib/sales";
import type { GlobalSearchResult } from "@/types/search";

const MAX_PER_GROUP = 4;
const MAX_TOTAL = 14;

function matches(query: string, ...parts: Array<string | undefined | null>) {
  return parts.some((part) => part?.toLowerCase().includes(query));
}

export function useGlobalSearchResults(query: string) {
  const { products, categories, suppliers, getCategoryById, getSupplierById } = useInventory();
  const { customers, workOrders, getCustomerById } = useCrm();
  const { sales } = useSales();

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: GlobalSearchResult[] = [];

    for (const product of products) {
      if (results.filter((r) => r.type === "product").length >= MAX_PER_GROUP) break;
      const category = getCategoryById(product.categoryId);
      const supplier = getSupplierById(product.supplierId);

      if (
        matches(
          q,
          product.name,
          product.internalCode,
          product.id,
          category?.name,
          supplier?.name
        )
      ) {
        results.push({
          id: product.id,
          type: "product",
          title: product.name,
          subtitle: `${product.internalCode} · ${category?.name ?? "Sin categoría"}`,
          module: "stock"
        });
      }
    }

    for (const customer of customers) {
      if (results.filter((r) => r.type === "customer").length >= MAX_PER_GROUP) break;
      if (matches(q, customer.name, customer.phone, customer.email, customer.id)) {
        results.push({
          id: customer.id,
          type: "customer",
          title: customer.name,
          subtitle: customer.phone,
          module: "clientes"
        });
      }
    }

    for (const sale of sales) {
      if (results.filter((r) => r.type === "sale").length >= MAX_PER_GROUP) break;
      if (
        matches(
          q,
          sale.reference,
          sale.customerName,
          sale.id,
          sale.paymentMethod,
          sale.status,
          getSaleItemsSummary(sale.items)
        )
      ) {
        results.push({
          id: sale.id,
          type: "sale",
          title: sale.reference,
          subtitle: sale.customerName ?? "Mostrador",
          module: "ventas"
        });
      }
    }

    for (const order of workOrders) {
      if (results.filter((r) => r.type === "work-order").length >= MAX_PER_GROUP) break;
      const customer = getCustomerById(order.customerId);
      if (
        matches(
          q,
          order.id,
          order.problem,
          order.mechanic,
          order.status,
          customer?.name
        )
      ) {
        results.push({
          id: order.id,
          type: "work-order",
          title: order.id,
          subtitle: `${customer?.name ?? "Cliente"} · ${order.status}`,
          module: "taller"
        });
      }
    }

    for (const supplier of suppliers) {
      if (results.filter((r) => r.type === "supplier").length >= MAX_PER_GROUP) break;
      if (matches(q, supplier.name, supplier.contact, supplier.email, supplier.id)) {
        results.push({
          id: supplier.id,
          type: "supplier",
          title: supplier.name,
          subtitle: supplier.contact ?? supplier.email ?? "Proveedor",
          module: "proveedores"
        });
      }
    }

    for (const category of categories) {
      if (results.filter((r) => r.type === "category").length >= MAX_PER_GROUP) break;
      if (matches(q, category.name, category.description, category.id)) {
        results.push({
          id: category.id,
          type: "category",
          title: category.name,
          subtitle: "Categoría",
          module: "categorias"
        });
      }
    }

    return results.slice(0, MAX_TOTAL);
  }, [
    query,
    products,
    categories,
    suppliers,
    customers,
    workOrders,
    sales,
    getCategoryById,
    getSupplierById,
    getCustomerById
  ]);
}
