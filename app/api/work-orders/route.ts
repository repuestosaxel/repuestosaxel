import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import { createWorkOrder, listCrmSnapshot } from "@/lib/services/crm.service";
import { createWorkOrderSchema } from "@/lib/validations/work-order";

export async function GET() {
  try {
    const snapshot = await listCrmSnapshot();
    return apiSuccess(snapshot.workOrders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createWorkOrderSchema.parse(await request.json());
    const workOrder = await createWorkOrder(body);
    return apiSuccess(workOrder, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
