import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { listCrmSnapshot, updateCustomer } from "@/lib/services/crm.service";
import { updateCustomerSchema } from "@/lib/validations/customer";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const snapshot = await listCrmSnapshot();
    const customer = snapshot.customers.find((item) => item.id === id);

    if (!customer) {
      return apiError("Cliente no encontrado.", 404);
    }

    return apiSuccess(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateCustomerSchema.parse(await request.json());
    const customer = await updateCustomer(id, body);

    if (!customer) {
      return apiError("Cliente no encontrado.", 404);
    }

    return apiSuccess(customer);
  } catch (error) {
    return handleApiError(error);
  }
}
