import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import { createCustomer, listCrmSnapshot } from "@/lib/services/crm.service";
import { createCustomerSchema } from "@/lib/validations/customer";

export async function GET() {
  try {
    const snapshot = await listCrmSnapshot();
    return apiSuccess(snapshot.customers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createCustomerSchema.parse(await request.json());
    const customer = await createCustomer(body);
    return apiSuccess(customer, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
