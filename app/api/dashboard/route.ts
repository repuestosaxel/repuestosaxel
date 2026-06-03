import { apiSuccess, handleApiError } from "@/lib/api/response";
import { getDashboardMetrics } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const metrics = await getDashboardMetrics();
    return apiSuccess(metrics);
  } catch (error) {
    return handleApiError(error);
  }
}
