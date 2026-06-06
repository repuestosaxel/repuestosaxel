import { DEFAULT_PRODUCT_IMAGE } from "@/lib/product-image";

type UploadResponse = { ok: true; data: { url: string } } | { ok: false; error: string };

export async function uploadProductImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/product-image", {
    method: "POST",
    body: formData
  });

  const payload = (await response.json()) as UploadResponse;

  if (!response.ok || !payload.ok) {
    const message = !payload.ok ? payload.error : "No se pudo subir la imagen.";
    throw new Error(message);
  }

  return payload.data.url;
}

export async function resolveProductImageUrl(input: {
  imageFile: File | null;
  existingUrl?: string;
  requireUpload?: boolean;
}): Promise<string> {
  if (input.imageFile) {
    return uploadProductImageFile(input.imageFile);
  }

  if (input.requireUpload) {
    throw new Error("Subí una imagen del producto desde tu PC.");
  }

  if (input.existingUrl?.trim()) {
    return input.existingUrl.trim();
  }

  return DEFAULT_PRODUCT_IMAGE;
}
