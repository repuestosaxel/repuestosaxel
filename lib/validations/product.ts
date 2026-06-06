import { z } from "zod";

import { COMPATIBILITY_OPTIONS, type CompatibilityType } from "@/types/inventory";

const compatibilityEnum = z.enum(
  COMPATIBILITY_OPTIONS as [CompatibilityType, ...CompatibilityType[]]
);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().optional()
});

export const updateCategorySchema = createCategorySchema.partial();

export const createSubcategorySchema = z.object({
  categoryId: z.string().min(1, "La categoría es obligatoria."),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().optional()
});

export const updateSubcategorySchema = createSubcategorySchema.partial();

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  contact: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Email inválido.").optional().or(z.literal(""))
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const createProductSchema = z.object({
  internalCode: z.string().trim().min(1, "El código interno es obligatorio."),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().min(1, "La descripción es obligatoria."),
  categoryId: z.string().min(1, "La categoría es obligatoria."),
  subcategoryId: z.string().min(1, "La subcategoría es obligatoria."),
  supplierId: z.string().min(1, "El proveedor es obligatorio."),
  imageUrl: z.string().trim().min(1, "La imagen es obligatoria."),
  purchasePrice: z.coerce.number().positive("El precio de compra debe ser mayor a 0."),
  publicPrice: z.coerce.number().positive("El precio público debe ser mayor a 0."),
  stock: z.coerce.number().int().nonnegative(),
  min: z.coerce.number().int().nonnegative(),
  compatibility: z.array(compatibilityEnum).min(1, "Seleccioná al menos una compatibilidad.")
});

export const updateProductSchema = createProductSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
