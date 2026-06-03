import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import {
  createSubcategory,
  listInventorySnapshot
} from "@/lib/services/inventory.service";
import { createSubcategorySchema } from "@/lib/validations/product";

export async function GET() {
  try {
    const snapshot = await listInventorySnapshot();
    return apiSuccess(snapshot.subcategories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createSubcategorySchema.parse(await request.json());
    const subcategory = await createSubcategory(body);
    return apiSuccess(subcategory, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
