import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import {
  createCategory,
  listInventorySnapshot
} from "@/lib/services/inventory.service";
import { createCategorySchema } from "@/lib/validations/product";

export async function GET() {
  try {
    const snapshot = await listInventorySnapshot();
    return apiSuccess(snapshot.categories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createCategorySchema.parse(await request.json());
    const category = await createCategory(body);
    return apiSuccess(category, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
