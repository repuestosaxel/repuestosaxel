import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().trim().email("Email inválido."),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  roleId: z.string().min(1, "El rol es obligatorio."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
  active: z.boolean().optional()
});

export const updateUserSchema = z.object({
  email: z.string().trim().email("Email inválido.").optional(),
  name: z.string().trim().min(1).optional(),
  roleId: z.string().min(1).optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
  active: z.boolean().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
