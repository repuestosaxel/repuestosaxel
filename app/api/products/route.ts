import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import {
  createProduct,
  listInventorySnapshot
} from "@/lib/services/inventory.service";
import { createProductSchema } from "@/lib/validations/product";

export async function GET() {
  try {
    const snapshot = await listInventorySnapshot();
    return apiSuccess(snapshot.products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createProductSchema.parse(await request.json());
    const product = await createProduct(body);
    return apiSuccess(product, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
