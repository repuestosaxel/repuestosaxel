"use client";

import { useCallback } from "react";

import { useCrm } from "@/contexts/crm-context";
import { useInventory } from "@/contexts/inventory-context";
import { api } from "@/lib/api/client";
import type { WorkOrder } from "@/types/crm";

type OperationResult = { ok: true } | { ok: false; error: string };

export function useWorkOrderOperations() {
  const { getWorkOrderById, refresh: refreshCrm } = useCrm();
  const { refresh: refreshInventory, products } = useInventory();

  const addPartToWorkOrder = useCallback(
    async (orderId: string, productId: string, quantity: number): Promise<OperationResult> => {
      const order = getWorkOrderById(orderId);
      if (!order) {
        return { ok: false, error: "Orden de trabajo no encontrada." };
      }

      try {
        await api.post<WorkOrder>(`/api/work-orders/${orderId}/parts`, {
          productId,
          quantity
        });

        await Promise.all([refreshCrm(), refreshInventory()]);
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "No se pudo agregar el repuesto."
        };
      }
    },
    [getWorkOrderById, refreshCrm, refreshInventory]
  );

  const availableProducts = products.filter((product) => product.stock > 0);

  return {
    addPartToWorkOrder,
    availableProducts
  };
}
