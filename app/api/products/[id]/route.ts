import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import {
  deleteProduct,
  listInventorySnapshot,
  updateProduct
} from "@/lib/services/inventory.service";
import { updateProductSchema } from "@/lib/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const snapshot = await listInventorySnapshot();
    const product = snapshot.products.find((item) => item.id === id);

    if (!product) {
      return apiError("Producto no encontrado.", 404);
    }

    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateProductSchema.parse(await request.json());
    const product = await updateProduct(id, body);

    if (!product) {
      return apiError("Producto no encontrado.", 404);
    }

    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return apiError("Producto no encontrado.", 404);
    }

    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
