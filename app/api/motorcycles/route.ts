import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { addMotorcycle, listCrmSnapshot } from "@/lib/services/crm.service";
import { createMotorcycleSchema } from "@/lib/validations/customer";

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId") ?? undefined;
    const snapshot = await listCrmSnapshot();
    const motorcycles = customerId
      ? snapshot.motorcycles.filter((item) => item.customerId === customerId)
      : snapshot.motorcycles;

    return apiSuccess(motorcycles);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createMotorcycleSchema.parse(await request.json());
    const motorcycle = await addMotorcycle(body);

    if (!motorcycle) {
      return apiError("Cliente no encontrado.", 404);
    }

    return apiSuccess(motorcycle, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
