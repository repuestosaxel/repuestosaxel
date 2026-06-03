import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false as const, error: message, details }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError("Datos inválidos.", 422, error.flatten());
  }

  if (error instanceof Error) {
    console.error("[API]", error.message);
    return apiError(error.message, 500);
  }

  console.error("[API]", error);
  return apiError("Error interno del servidor.", 500);
}
