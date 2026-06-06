import { DEFAULT_PRODUCT_IMAGE } from "@/lib/inventory";

export function isLocalProductImage(src: string): boolean {
  return (
    src.startsWith("/") || src.startsWith("blob:") || src.startsWith("data:")
  );
}

export function isSupabaseProductImage(src: string): boolean {
  try {
    return new URL(src).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

/** URLs compatibles con next/image sin configurar más hostnames. */
export function supportsNextImageOptimizer(src: string): boolean {
  if (!src) return true;
  if (isLocalProductImage(src)) return true;
  return isSupabaseProductImage(src);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { DEFAULT_PRODUCT_IMAGE };
