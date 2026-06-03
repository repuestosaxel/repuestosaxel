"use client";

import { useCallback } from "react";

import { buildSaleLineItems, useSales } from "@/contexts/sales-context";
import { useCrm } from "@/contexts/crm-context";
import { useInventory } from "@/contexts/inventory-context";
import { useFinance } from "@/contexts/finance-context";
import type { CreateSaleInput, PaymentMethod, SaleCartItem, SaleStatus } from "@/types/sales";

type OperationResult = { ok: true; saleId: string } | { ok: false; error: string };

export function useSaleOperations() {
  const { createSale, updateSaleStatus, sales, refresh: refreshSales } = useSales();
  const { getCustomerById, refresh: refreshCrm } = useCrm();
  const { refresh: refreshInventory, products, getProductById } = useInventory();
  const { refresh: refreshFinance } = useFinance();

  const availableProducts = products.filter((product) => product.stock > 0);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshSales(), refreshInventory(), refreshCrm(), refreshFinance()]);
  }, [refreshSales, refreshInventory, refreshCrm, refreshFinance]);

  const completeSale = useCallback(
    async (
      cart: SaleCartItem[],
      input: Omit<CreateSaleInput, "items">
    ): Promise<OperationResult> => {
      if (cart.length === 0) {
        return { ok: false, error: "Agregá al menos un producto al carrito." };
      }

      const customer = input.customerId ? getCustomerById(input.customerId) : undefined;

      if (input.paymentMethod === "Cuenta corriente") {
        if (!customer) {
          return { ok: false, error: "Seleccioná un cliente para venta en cuenta corriente." };
        }
        if (!customer.accountEnabled) {
          return { ok: false, error: "El cliente seleccionado no tiene cuenta corriente habilitada." };
        }
      }

      for (const item of cart) {
        const product = getProductById(item.productId);
        if (!product) {
          return { ok: false, error: `Producto ${item.productName} no encontrado.` };
        }
        if (product.stock < item.quantity) {
          return {
            ok: false,
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock} u.`
          };
        }
      }

      try {
        const items = buildSaleLineItems(
          cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        );

        const sale = await createSale({
          ...input,
          items,
          status: input.status ?? "Pagado"
        });

        await refreshAll();
        return { ok: true, saleId: sale.id };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "No se pudo completar la venta."
        };
      }
    },
    [getCustomerById, getProductById, createSale, refreshAll]
  );

  const changeSaleStatus = useCallback(
    async (saleId: string, nextStatus: SaleStatus): Promise<OperationResult> => {
      const sale = sales.find((item) => item.id === saleId);
      if (!sale) {
        return { ok: false, error: "Venta no encontrada." };
      }

      if (sale.status === nextStatus) {
        return { ok: true, saleId };
      }

      if (sale.status === "Cancelado") {
        return { ok: false, error: "No se puede modificar una venta cancelada." };
      }

      try {
        await updateSaleStatus(saleId, nextStatus);
        await refreshAll();
        return { ok: true, saleId };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "No se pudo actualizar la venta."
        };
      }
    },
    [sales, updateSaleStatus, refreshAll]
  );

  return {
    availableProducts,
    completeSale,
    changeSaleStatus
  };
}

export function buildCartItem(product: {
  id: string;
  name: string;
  internalCode: string;
  publicPrice: number;
  stock: number;
}): SaleCartItem {
  return {
    productId: product.id,
    productName: product.name,
    internalCode: product.internalCode,
    quantity: 1,
    unitPrice: product.publicPrice,
    stock: product.stock
  };
}

export function mergeCartItem(cart: SaleCartItem[], item: SaleCartItem): SaleCartItem[] {
  const existing = cart.find((entry) => entry.productId === item.productId);

  if (!existing) {
    return [...cart, item];
  }

  const nextQuantity = existing.quantity + item.quantity;
  if (nextQuantity > existing.stock) {
    return cart;
  }

  return cart.map((entry) =>
    entry.productId === item.productId ? { ...entry, quantity: nextQuantity } : entry
  );
}

export function updateCartQuantity(
  cart: SaleCartItem[],
  productId: string,
  quantity: number
): SaleCartItem[] {
  if (quantity <= 0) {
    return cart.filter((item) => item.productId !== productId);
  }

  return cart.map((item) =>
    item.productId === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
  );
}

export function getCartTotal(cart: SaleCartItem[]): number {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export type { PaymentMethod };
