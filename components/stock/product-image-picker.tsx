"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, ImagePlus, X } from "lucide-react";

import { ProductImage } from "@/components/stock/product-image";
import { Button } from "@/components/ui/button";
import { DEFAULT_PRODUCT_IMAGE, formatFileSize } from "@/lib/product-image";
import { cn } from "@/lib/utils";

type ProductImagePickerProps = {
  previewSrc: string;
  imageFile: File | null;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  onInvalidFile?: (message: string) => void;
  inputId: string;
  mode: "create" | "edit";
  existingImageUrl?: string;
};

export function ProductImagePicker({
  previewSrc,
  imageFile,
  onFileSelect,
  onClear,
  onInvalidFile,
  inputId,
  mode,
  existingImageUrl
}: ProductImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasNewImage = Boolean(imageFile);
  const hasPreview = previewSrc !== DEFAULT_PRODUCT_IMAGE;

  useEffect(() => {
    return () => {
      if (previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onInvalidFile?.("El archivo debe ser una imagen (JPG, PNG, WEBP o GIF).");
      return;
    }

    onFileSelect(file);
    event.target.value = "";
  };

  const statusLabel = hasNewImage
    ? "Nueva imagen lista para guardar"
    : mode === "edit" && hasPreview
      ? "Imagen actual del producto"
      : "Sin imagen seleccionada";

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-black/40 transition-all",
          hasNewImage
            ? "border-racing-red/50 shadow-glow"
            : hasPreview
              ? "border-white/10"
              : "border-dashed border-white/15"
        )}
      >
        <div className="relative aspect-square">
          {hasPreview ? (
            <ProductImage src={previewSrc} alt="Vista previa del producto" priority />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <ImagePlus className="size-10 text-white/25" />
              <p className="text-sm text-white/45">
                {mode === "create"
                  ? "Subí una foto del repuesto"
                  : "Seleccioná una nueva imagen si querés reemplazar la actual"}
              </p>
            </div>
          )}

          {hasNewImage ? (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
              <CheckCircle2 className="size-3.5" />
              Vista previa
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
              Imagen del producto
            </p>
            <p className="mt-1 text-sm font-medium text-white">{statusLabel}</p>
            {imageFile ? (
              <p className="mt-1 truncate text-xs text-white/45">
                {imageFile.name} · {formatFileSize(imageFile.size)}
              </p>
            ) : mode === "edit" && existingImageUrl && !hasNewImage ? (
              <p className="mt-1 text-xs text-white/38">
                Se conservará la imagen actual si no elegís otra.
              </p>
            ) : null}
          </div>

          {hasNewImage && onClear ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0 border-red-500/20 text-red-200"
              onClick={onClear}
            >
              <X className="size-3.5" />
              Quitar
            </Button>
          ) : null}
        </div>

        <label
          htmlFor={inputId}
          className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white/68 transition-colors hover:border-racing-red/40 hover:bg-racing-red/5 hover:text-white"
        >
          <ImagePlus className="size-4 text-racing-red" />
          {hasNewImage ? "Cambiar imagen" : "Seleccionar desde la PC"}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <p className="mt-3 text-[11px] leading-5 text-white/35">
          JPG, PNG, WEBP o GIF · máximo 5 MB. La imagen se sube a Supabase al guardar.
        </p>
      </div>
    </div>
  );
}
