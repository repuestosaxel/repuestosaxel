import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import {
  deleteSupplier,
  listInventorySnapshot,
  updateSupplier
} from "@/lib/services/inventory.service";
import { updateSupplierSchema } from "@/lib/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const snapshot = await listInventorySnapshot();
    const supplier = snapshot.suppliers.find((item) => item.id === id);

    if (!supplier) {
      return apiError("Proveedor no encontrado.", 404);
    }

    return apiSuccess(supplier);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateSupplierSchema.parse(await request.json());
    const supplier = await updateSupplier(id, body);

    if (!supplier) {
      return apiError("Proveedor no encontrado.", 404);
    }

    return apiSuccess(supplier);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteSupplier(id);

    if (!result.ok) {
      return apiError(result.error, result.error.includes("no encontrado") ? 404 : 400);
    }

    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
