"use client";

import { useCallback } from "react";

import { useCrm } from "@/contexts/crm-context";
import { useInventory } from "@/contexts/inventory-context";
import { canAddPartsToWorkOrder } from "@/lib/crm";

type OperationResult = { ok: true } | { ok: false; error: string };

export function useWorkOrderOperations() {
  const { getWorkOrderById, getCustomerById, addWorkOrderPart } = useCrm();
  const { getProductById, consumeProductStock, products } = useInventory();

  const addPartToWorkOrder = useCallback(
    (orderId: string, productId: string, quantity: number): OperationResult => {
      const order = getWorkOrderById(orderId);
      if (!order) {
        return { ok: false, error: "Orden de trabajo no encontrada." };
      }

      if (!canAddPartsToWorkOrder(order.status)) {
        return {
          ok: false,
          error: "Los repuestos solo pueden agregarse desde «En reparación» en adelante."
        };
      }

      const product = getProductById(productId);
      if (!product) {
        return { ok: false, error: "Producto no encontrado en inventario." };
      }

      const customer = getCustomerById(order.customerId);
      const consumeResult = consumeProductStock(productId, quantity, {
        workOrderId: orderId,
        detail: `Uso en taller — ${orderId}${customer ? ` (${customer.name})` : ""}`
      });

      if (!consumeResult.ok) {
        return consumeResult;
      }

      addWorkOrderPart(orderId, {
        productId,
        productName: product.name,
        internalCode: product.internalCode,
        quantity,
        unitPrice: product.publicPrice
      });

      return { ok: true };
    },
    [getWorkOrderById, getCustomerById, getProductById, consumeProductStock, addWorkOrderPart]
  );

  const availableProducts = products.filter((product) => product.stock > 0);

  return {
    addPartToWorkOrder,
    availableProducts
  };
}
