import { NextRequest } from "next/server";

import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { uploadProductImage } from "@/lib/supabase/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("Se requiere un archivo de imagen.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage({
      buffer,
      fileName: file.name,
      contentType: file.type
    });

    return apiSuccess({ url }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
