import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import {
  deleteCategory,
  listInventorySnapshot,
  updateCategory
} from "@/lib/services/inventory.service";
import { updateCategorySchema } from "@/lib/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const snapshot = await listInventorySnapshot();
    const category = snapshot.categories.find((item) => item.id === id);

    if (!category) {
      return apiError("Categoría no encontrada.", 404);
    }

    return apiSuccess(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateCategorySchema.parse(await request.json());
    const category = await updateCategory(id, body);

    if (!category) {
      return apiError("Categoría no encontrada.", 404);
    }

    return apiSuccess(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteCategory(id);

    if (!result.ok) {
      return apiError(result.error, result.error.includes("no encontrada") ? 404 : 400);
    }

    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
