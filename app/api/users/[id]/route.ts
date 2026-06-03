import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { getUser, updateUser } from "@/lib/services/users.service";
import { updateUserSchema } from "@/lib/validations/user";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getUser(id);

    if (!user) {
      return apiError("Usuario no encontrado.", 404);
    }

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateUserSchema.parse(await request.json());
    const user = await updateUser(id, body);

    if (!user) {
      return apiError("Usuario no encontrado.", 404);
    }

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
