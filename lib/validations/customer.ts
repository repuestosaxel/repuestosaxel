import { z } from "zod";

const motorcycleSchema = z.object({
  brandModel: z.string().trim().min(1, "Marca/modelo obligatorio."),
  plate: z.string().trim().min(1, "Patente obligatoria."),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  notes: z.string().trim().optional()
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  phone: z.string().trim().min(1, "El teléfono es obligatorio."),
  email: z.string().trim().email("Email inválido.").optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  accountEnabled: z.boolean(),
  initialBalance: z.coerce.number().optional(),
  motorcycles: z.array(motorcycleSchema).optional()
});

export const updateCustomerSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  email: z.string().trim().email("Email inválido.").optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  accountEnabled: z.boolean().optional(),
  balance: z.coerce.number().optional()
});

export const createMotorcycleSchema = z.object({
  customerId: z.string().min(1, "El cliente es obligatorio."),
  brandModel: z.string().trim().min(1, "Marca/modelo obligatorio."),
  plate: z.string().trim().min(1, "Patente obligatoria."),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  notes: z.string().trim().optional()
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateMotorcycleInput = z.infer<typeof createMotorcycleSchema>;
