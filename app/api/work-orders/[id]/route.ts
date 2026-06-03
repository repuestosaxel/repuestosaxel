import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { listCrmSnapshot, updateWorkOrder } from "@/lib/services/crm.service";
import { updateWorkOrderSchema } from "@/lib/validations/work-order";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const snapshot = await listCrmSnapshot();
    const workOrder = snapshot.workOrders.find((item) => item.id === id);

    if (!workOrder) {
      return apiError("Orden de trabajo no encontrada.", 404);
    }

    return apiSuccess(workOrder);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateWorkOrderSchema.parse(await request.json());
    const workOrder = await updateWorkOrder(id, body);

    if (!workOrder) {
      return apiError("Orden de trabajo no encontrada.", 404);
    }

    return apiSuccess(workOrder);
  } catch (error) {
    return handleApiError(error);
  }
}
