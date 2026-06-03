import { apiSuccess, handleApiError } from "@/lib/api/response";
import { listInventorySnapshot } from "@/lib/services/inventory.service";

export async function GET() {
  try {
    const snapshot = await listInventorySnapshot();
    return apiSuccess(snapshot);
  } catch (error) {
    return handleApiError(error);
  }
}
