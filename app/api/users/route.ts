import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import { createUser, listUsers } from "@/lib/services/users.service";
import { createUserSchema } from "@/lib/validations/user";

export async function GET() {
  try {
    const users = await listUsers();
    return apiSuccess(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createUserSchema.parse(await request.json());
    const user = await createUser(body);
    return apiSuccess(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
