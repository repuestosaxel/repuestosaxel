import { Prisma, type StockMovementType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import {
  mapCategory,
  mapCompatibilities,
  mapProduct,
  mapStockMovement,
  mapSubcategory,
  mapSupplier,
  STOCK_MOVEMENT_TO_DB
} from "@/lib/db/mappers";
import { DEFAULT_PRODUCT_IMAGE, pickProductAccent } from "@/lib/inventory";
import { deleteProductImageIfManaged } from "@/lib/supabase/storage";
import type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  CreateSubcategoryInput,
  CreateSupplierInput,
  InventorySnapshot,
  Product,
  ProductHistoryEntry,
  Subcategory,
  Supplier,
  UpdateCategoryInput,
  UpdateProductInput,
  UpdateSubcategoryInput,
  UpdateSupplierInput
} from "@/types/inventory";

export type StockOperationResult = { ok: true } | { ok: false; error: string };

export type ConsumeStockMeta = {
  type: "uso_taller" | "venta";
  reference: string;
  detail: string;
  saleId?: string;
  workOrderId?: string;
  supplierId?: string;
  createdById?: string;
};

type StockTx = Prisma.TransactionClient;

async function appendStockMovement(
  tx: StockTx,
  input: {
    productId: string;
    type: StockMovementType;
    quantity: number | null;
    amount: number | null;
    detail: string;
    reference?: string;
    supplierId?: string;
    saleId?: string;
    workOrderId?: string;
    createdById?: string;
  }
) {
  await tx.stockMovement.create({
    data: {
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      amount: input.amount !== null ? new Prisma.Decimal(input.amount) : null,
      detail: input.detail,
      reference: input.reference,
      supplierId: input.supplierId,
      saleId: input.saleId,
      workOrderId: input.workOrderId,
      createdById: input.createdById
    }
  });
}

export async function listInventorySnapshot(): Promise<InventorySnapshot> {
  const [categories, subcategories, suppliers, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.subcategory.findMany({ orderBy: [{ categoryId: "asc" }, { name: "asc" }] }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    })
  ]);

  return {
    categories: categories.map(mapCategory),
    subcategories: subcategories.map(mapSubcategory),
    suppliers: suppliers.map(mapSupplier),
    products: products.map(mapProduct)
  };
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const row = await prisma.category.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null
    }
  });

  return mapCategory(row);
}

export async function createSubcategory(input: CreateSubcategoryInput): Promise<Subcategory> {
  const row = await prisma.subcategory.create({
    data: {
      categoryId: input.categoryId,
      name: input.name.trim(),
      description: input.description?.trim() || null
    }
  });

  return mapSubcategory(row);
}

export type CatalogDeleteResult = { ok: true } | { ok: false; error: string };

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category | null> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return null;

  try {
    const row = await prisma.category.update({
      where: { id },
      data: {
        name: input.name?.trim(),
        description:
          input.description !== undefined ? input.description.trim() || null : undefined
      }
    });

    return mapCategory(row);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe una categoría con ese nombre.");
    }
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<CatalogDeleteResult> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Categoría no encontrada." };
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${productCount} producto(s) usan esta categoría.`
    };
  }

  await prisma.category.delete({ where: { id } });
  return { ok: true };
}

export async function updateSubcategory(
  id: string,
  input: UpdateSubcategoryInput
): Promise<Subcategory | null> {
  const existing = await prisma.subcategory.findUnique({ where: { id } });
  if (!existing) return null;

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw new Error("La categoría seleccionada no existe.");
    }
  }

  try {
    const row = await prisma.subcategory.update({
      where: { id },
      data: {
        categoryId: input.categoryId,
        name: input.name?.trim(),
        description:
          input.description !== undefined ? input.description.trim() || null : undefined
      }
    });

    return mapSubcategory(row);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe una subcategoría con ese nombre en la categoría.");
    }
    throw error;
  }
}

export async function deleteSubcategory(id: string): Promise<CatalogDeleteResult> {
  const existing = await prisma.subcategory.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Subcategoría no encontrada." };
  }

  const productCount = await prisma.product.count({ where: { subcategoryId: id } });
  if (productCount > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${productCount} producto(s) usan esta subcategoría.`
    };
  }

  await prisma.subcategory.delete({ where: { id } });
  return { ok: true };
}

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  const row = await prisma.supplier.create({
    data: {
      name: input.name.trim(),
      contact: input.contact?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null
    }
  });

  return mapSupplier(row);
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput
): Promise<Supplier | null> {
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.supplier.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      contact: input.contact !== undefined ? input.contact.trim() || null : undefined,
      phone: input.phone !== undefined ? input.phone.trim() || null : undefined,
      email: input.email !== undefined ? input.email.trim() || null : undefined
    }
  });

  return mapSupplier(row);
}

export async function deleteSupplier(id: string): Promise<CatalogDeleteResult> {
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Proveedor no encontrado." };
  }

  const [productCount, purchaseCount] = await Promise.all([
    prisma.product.count({ where: { supplierId: id } }),
    prisma.supplierPurchase.count({ where: { supplierId: id } })
  ]);

  if (productCount > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${productCount} producto(s) usan este proveedor.`
    };
  }

  if (purchaseCount > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${purchaseCount} compra(s) registrada(s) con este proveedor.`
    };
  }

  await prisma.supplier.delete({ where: { id } });
  return { ok: true };
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const productCount = await prisma.product.count();

  try {
  const row = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        internalCode: input.internalCode.trim().toUpperCase(),
        name: input.name.trim(),
        description: input.description.trim(),
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        supplierId: input.supplierId,
        imageUrl: input.imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
        purchasePrice: new Prisma.Decimal(input.purchasePrice),
        publicPrice: new Prisma.Decimal(input.publicPrice),
        stock: input.stock,
        min: input.min,
        compatibility: mapCompatibilities(input.compatibility),
        accent: pickProductAccent(productCount)
      }
    });

    await appendStockMovement(tx, {
      productId: product.id,
      type: STOCK_MOVEMENT_TO_DB.creacion,
      quantity: null,
      amount: null,
      detail: `Alta de producto — ${product.name}`,
      reference: product.internalCode
    });

    if (input.stock > 0) {
      await appendStockMovement(tx, {
        productId: product.id,
        type: STOCK_MOVEMENT_TO_DB.ingreso_proveedor,
        quantity: input.stock,
        amount: input.purchasePrice * input.stock,
        detail: `Stock inicial de ${input.stock} unidades`,
        supplierId: input.supplierId
      });
    }

    return product;
  });

  return mapProduct(row);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un producto con ese código interno.");
    }
    throw error;
  }
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product | null> {
  const existing = await prisma.product.findFirst({ where: { id, active: true } });
  if (!existing) return null;

  try {
  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id },
      data: {
        internalCode: input.internalCode?.trim().toUpperCase(),
        name: input.name?.trim(),
        description: input.description?.trim(),
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        supplierId: input.supplierId,
        imageUrl: input.imageUrl?.trim() || undefined,
        purchasePrice:
          input.purchasePrice !== undefined ? new Prisma.Decimal(input.purchasePrice) : undefined,
        publicPrice:
          input.publicPrice !== undefined ? new Prisma.Decimal(input.publicPrice) : undefined,
        stock: input.stock,
        min: input.min,
        compatibility:
          input.compatibility !== undefined ? mapCompatibilities(input.compatibility) : undefined
      }
    });

    if (input.stock !== undefined && input.stock !== existing.stock) {
      const delta = input.stock - existing.stock;
      await appendStockMovement(tx, {
        productId: id,
        type: STOCK_MOVEMENT_TO_DB.ajuste_stock,
        quantity: delta,
        amount: null,
        detail: `Ajuste manual de stock — ${delta > 0 ? "+" : ""}${delta} u.`,
        reference: updated.internalCode
      });
    }

    return updated;
  });

  const mapped = mapProduct(row);

  if (input.imageUrl !== undefined && mapped.imageUrl !== existing.imageUrl) {
    await deleteProductImageIfManaged(existing.imageUrl);
  }

  return mapped;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un producto con ese código interno.");
    }
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const existing = await prisma.product.findFirst({ where: { id, active: true } });
  if (!existing) return false;

  await prisma.product.update({
    where: { id },
    data: { active: false }
  });

  return true;
}

export async function consumeStock(
  tx: StockTx,
  productId: string,
  quantity: number,
  meta: ConsumeStockMeta
): Promise<StockOperationResult> {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: "La cantidad debe ser mayor a 0." };
  }

  const product = await tx.product.findFirst({
    where: { id: productId, active: true }
  });

  if (!product) {
    return { ok: false, error: "Producto no encontrado en inventario." };
  }

  if (product.stock < quantity) {
    return {
      ok: false,
      error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock} u.`
    };
  }

  await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } }
  });

  await appendStockMovement(tx, {
    productId,
    type: STOCK_MOVEMENT_TO_DB[meta.type],
    quantity: -quantity,
    amount: Number(product.publicPrice) * quantity,
    detail: meta.detail,
    reference: meta.reference,
    supplierId: meta.supplierId,
    saleId: meta.saleId,
    workOrderId: meta.workOrderId,
    createdById: meta.createdById
  });

  return { ok: true };
}

export async function restoreStock(
  tx: StockTx,
  productId: string,
  quantity: number,
  meta: ConsumeStockMeta
): Promise<StockOperationResult> {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: "La cantidad debe ser mayor a 0." };
  }

  const product = await tx.product.findFirst({
    where: { id: productId, active: true }
  });

  if (!product) {
    return { ok: false, error: "Producto no encontrado en inventario." };
  }

  await tx.product.update({
    where: { id: productId },
    data: { stock: { increment: quantity } }
  });

  await appendStockMovement(tx, {
    productId,
    type: STOCK_MOVEMENT_TO_DB.ajuste_stock,
    quantity,
    amount: null,
    detail: meta.detail,
    reference: meta.reference,
    saleId: meta.saleId,
    workOrderId: meta.workOrderId,
    createdById: meta.createdById
  });

  return { ok: true };
}

export async function getProductHistory(productId: string): Promise<ProductHistoryEntry[]> {
  const rows = await prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" }
  });

  return rows.map(mapStockMovement);
}
