import { z } from "zod";

import { COMPATIBILITY_OPTIONS, type CompatibilityType } from "@/types/inventory";

const compatibilityEnum = z.enum(
  COMPATIBILITY_OPTIONS as [CompatibilityType, ...CompatibilityType[]]
);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().optional()
});

export const createSubcategorySchema = z.object({
  categoryId: z.string().min(1, "La categoría es obligatoria."),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().optional()
});

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  contact: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Email inválido.").optional().or(z.literal(""))
});

export const createProductSchema = z.object({
  internalCode: z.string().trim().min(1, "El código interno es obligatorio."),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().min(1, "La descripción es obligatoria."),
  categoryId: z.string().min(1, "La categoría es obligatoria."),
  subcategoryId: z.string().min(1, "La subcategoría es obligatoria."),
  supplierId: z.string().min(1, "El proveedor es obligatorio."),
  imageUrl: z.string().trim().min(1, "La imagen es obligatoria."),
  purchasePrice: z.coerce.number().nonnegative(),
  publicPrice: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  min: z.coerce.number().int().nonnegative(),
  compatibility: z.array(compatibilityEnum).min(1, "Seleccioná al menos una compatibilidad.")
});

export const updateProductSchema = createProductSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
