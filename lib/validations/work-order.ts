import { z } from "zod";

import {
  WORK_ORDER_STATUSES,
  WORKSHOP_MECHANICS,
  type WorkOrderStatus
} from "@/types/crm";

export const createWorkOrderSchema = z.object({
  customerId: z.string().min(1, "El cliente es obligatorio."),
  motorcycleId: z.string().min(1).optional(),
  problem: z.string().trim().min(1, "El problema es obligatorio."),
  observations: z.string().trim().optional(),
  mechanic: z.enum(WORKSHOP_MECHANICS),
  status: z.enum(WORK_ORDER_STATUSES as [WorkOrderStatus, ...WorkOrderStatus[]]).optional()
});

export const updateWorkOrderSchema = z.object({
  status: z.enum(WORK_ORDER_STATUSES as [WorkOrderStatus, ...WorkOrderStatus[]]).optional(),
  observations: z.string().trim().optional(),
  mechanic: z.enum(WORKSHOP_MECHANICS).optional(),
  problem: z.string().trim().min(1).optional(),
  laborCost: z.coerce.number().nonnegative().optional()
});

export const addWorkOrderPartSchema = z.object({
  productId: z.string().min(1, "El producto es obligatorio."),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0.")
});

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
export type AddWorkOrderPartInput = z.infer<typeof addWorkOrderPartSchema>;
