import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { createSale, listSales } from "@/lib/services/sales.service";
import { createSaleSchema } from "@/lib/validations/sale";

export async function GET() {
  try {
    const sales = await listSales();
    return apiSuccess(sales);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createSaleSchema.parse(await request.json());
    const result = await createSale(body);

    if (!result.ok) {
      return apiError(result.error, 400);
    }

    return apiSuccess(result.sale, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
