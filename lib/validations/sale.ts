import { z } from "zod";

import {
  PAYMENT_METHODS,
  SALE_STATUSES,
  type PaymentMethod,
  type SaleStatus
} from "@/types/sales";

const saleLineSchema = z.object({
  productId: z.string().min(1, "El producto es obligatorio."),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0.")
});

export const createSaleSchema = z.object({
  items: z.array(saleLineSchema).min(1, "Agregá al menos un producto."),
  customerId: z.string().min(1).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]]),
  status: z.enum(SALE_STATUSES as [SaleStatus, ...SaleStatus[]]).optional(),
  notes: z.string().trim().optional()
});

export const updateSaleSchema = z.object({
  status: z.enum(SALE_STATUSES as [SaleStatus, ...SaleStatus[]]).optional(),
  notes: z.string().trim().optional()
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
