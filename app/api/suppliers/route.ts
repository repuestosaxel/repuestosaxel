import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import {
  createSupplier,
  listInventorySnapshot
} from "@/lib/services/inventory.service";
import { createSupplierSchema } from "@/lib/validations/product";

export async function GET() {
  try {
    const snapshot = await listInventorySnapshot();
    return apiSuccess(snapshot.suppliers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createSupplierSchema.parse(await request.json());
    const supplier = await createSupplier(body);
    return apiSuccess(supplier, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
