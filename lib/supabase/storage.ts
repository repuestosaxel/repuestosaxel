import { randomUUID } from "crypto";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const PRODUCT_IMAGE_BUCKET = "repuestosaxel";
export const PRODUCT_IMAGE_FOLDER = "products";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeFileName(fileName: string): string {
  const base = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "product-image";
}

function buildObjectPath(fileName: string): string {
  const safeName = sanitizeFileName(fileName);
  return `${PRODUCT_IMAGE_FOLDER}/${randomUUID()}-${safeName}`;
}

export function getPublicStorageUrl(objectPath: string): string {
  const supabase = createSupabaseAdmin();
  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export function isManagedProductImageUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return (
      url.pathname.includes(`/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`) &&
      url.pathname.includes(`/${PRODUCT_IMAGE_FOLDER}/`)
    );
  } catch {
    return false;
  }
}

function extractObjectPathFromPublicUrl(imageUrl: string): string | null {
  if (!isManagedProductImageUrl(imageUrl)) return null;

  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;

  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

export async function uploadProductImage(input: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(input.contentType)) {
    throw new Error("Formato de imagen no permitido. Usá JPG, PNG, WEBP o GIF.");
  }

  if (input.buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error("La imagen no puede superar los 5 MB.");
  }

  const objectPath = buildObjectPath(input.fileName);
  const supabase = createSupabaseAdmin();

  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(objectPath, input.buffer, {
    contentType: input.contentType,
    upsert: false,
    cacheControl: "3600"
  });

  if (error) {
    throw new Error(`No se pudo subir la imagen a Supabase Storage: ${error.message}`);
  }

  return getPublicStorageUrl(objectPath);
}

export async function deleteProductImageIfManaged(imageUrl: string): Promise<void> {
  const objectPath = extractObjectPathFromPublicUrl(imageUrl);
  if (!objectPath) return;

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([objectPath]);

  if (error) {
    console.warn("[storage] No se pudo eliminar imagen anterior:", error.message);
  }
}
