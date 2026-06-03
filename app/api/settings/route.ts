import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import { listSettings, upsertSetting } from "@/lib/services/settings.service";
import { patchSettingsSchema, upsertSettingSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const settings = await listSettings();
    return apiSuccess(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = upsertSettingSchema.parse(await request.json());
    const setting = await upsertSetting(body);
    return apiSuccess(setting, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = patchSettingsSchema.parse(await request.json());
    const settings = await Promise.all(body.settings.map((item) => upsertSetting(item)));
    return apiSuccess(settings);
  } catch (error) {
    return handleApiError(error);
  }
}
