import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import { getProductHistory } from "@/lib/services/inventory.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const history = await getProductHistory(id);
    return apiSuccess(history);
  } catch (error) {
    return handleApiError(error);
  }
}
