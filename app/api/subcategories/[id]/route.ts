import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import {
  deleteSubcategory,
  listInventorySnapshot,
  updateSubcategory
} from "@/lib/services/inventory.service";
import { updateSubcategorySchema } from "@/lib/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const snapshot = await listInventorySnapshot();
    const subcategory = snapshot.subcategories.find((item) => item.id === id);

    if (!subcategory) {
      return apiError("Subcategoría no encontrada.", 404);
    }

    return apiSuccess(subcategory);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateSubcategorySchema.parse(await request.json());
    const subcategory = await updateSubcategory(id, body);

    if (!subcategory) {
      return apiError("Subcategoría no encontrada.", 404);
    }

    return apiSuccess(subcategory);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteSubcategory(id);

    if (!result.ok) {
      return apiError(result.error, result.error.includes("no encontrada") ? 404 : 400);
    }

    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
