import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { listSales, updateSaleStatus } from "@/lib/services/sales.service";
import { updateSaleSchema } from "@/lib/validations/sale";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sales = await listSales();
    const sale = sales.find((item) => item.id === id);

    if (!sale) {
      return apiError("Venta no encontrada.", 404);
    }

    return apiSuccess(sale);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateSaleSchema.parse(await request.json());

    if (!body.status) {
      return apiError("Se requiere el estado de la venta.", 400);
    }

    const result = await updateSaleStatus(id, body.status);

    if (!result.ok) {
      return apiError(result.error, 400);
    }

    return apiSuccess(result.sale);
  } catch (error) {
    return handleApiError(error);
  }
}
