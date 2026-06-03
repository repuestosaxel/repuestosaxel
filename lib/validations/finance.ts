import { z } from "zod";

import type { ExpenseCategory } from "@/types/finance";

const expenseCategories = [
  "compra_proveedor",
  "reposicion_stock",
  "operativo"
] as const satisfies readonly ExpenseCategory[];

export const createExpenseSchema = z.object({
  category: z.enum(expenseCategories),
  description: z.string().trim().min(1, "La descripción es obligatoria."),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0."),
  reference: z.string().trim().optional(),
  supplierId: z.string().min(1).optional(),
  date: z.string().datetime().optional()
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
