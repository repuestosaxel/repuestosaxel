import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { addWorkOrderPart } from "@/lib/services/crm.service";
import { addWorkOrderPartSchema } from "@/lib/validations/work-order";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = addWorkOrderPartSchema.parse(await request.json());
    const result = await addWorkOrderPart(id, body);

    if (!result.ok) {
      return apiError(result.error, 400);
    }

    return apiSuccess(result.data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
