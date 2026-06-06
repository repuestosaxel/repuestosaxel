"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";

import { ProductImagePicker } from "@/components/stock/product-image-picker";
import {
  ModalField,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/contexts/inventory-context";
import { resolveProductImageUrl } from "@/lib/api/upload-product-image";
import { getMarginPercent } from "@/lib/inventory";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/product-image";
import { cn, money } from "@/lib/utils";
import { COMPATIBILITY_OPTIONS, type CompatibilityType, type Product } from "@/types/inventory";

type EditProductDialogProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormState = {
  internalCode: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  supplierId: string;
  purchasePrice: string;
  publicPrice: string;
  stock: string;
  min: string;
  compatibility: CompatibilityType[];
};

function productToForm(product: Product): FormState {
  return {
    internalCode: product.internalCode,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    supplierId: product.supplierId,
    purchasePrice: String(product.purchasePrice),
    publicPrice: String(product.publicPrice),
    stock: String(product.stock),
    min: String(product.min),
    compatibility: [...product.compatibility]
  };
}

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
  const { categories, suppliers, updateProduct, getSubcategoriesByCategory } = useInventory();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_PRODUCT_IMAGE);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (product && open) {
      setForm(productToForm(product));
      setImageFile(null);
      setImagePreview(product.imageUrl || DEFAULT_PRODUCT_IMAGE);
      setSavedImageUrl(null);
      setError(null);
    }
  }, [product, open]);

  const subcategoryOptions = useMemo(
    () => (form?.categoryId ? getSubcategoriesByCategory(form.categoryId) : []),
    [form?.categoryId, getSubcategoriesByCategory]
  );

  const previewMargin = useMemo(() => {
    if (!form) return null;
    const purchase = Number(form.purchasePrice);
    const publicPrice = Number(form.publicPrice);
    if (!Number.isFinite(purchase) || !Number.isFinite(publicPrice) || purchase <= 0) return null;
    return getMarginPercent(purchase, publicPrice);
  }, [form]);

  if (!product || !form) return null;

  const existingImageUrl = product.imageUrl || DEFAULT_PRODUCT_IMAGE;

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
    setError(null);
  };

  const handleCategoryChange = (categoryId: string) => {
    const subs = getSubcategoriesByCategory(categoryId);
    setForm((current) =>
      current
        ? {
            ...current,
            categoryId,
            subcategoryId: subs.some((sub) => sub.id === current.subcategoryId)
              ? current.subcategoryId
              : subs[0]?.id ?? ""
          }
        : current
    );
    setError(null);
  };

  const toggleCompatibility = (value: CompatibilityType) => {
    setForm((current) => {
      if (!current) return current;
      const exists = current.compatibility.includes(value);
      const compatibility = exists
        ? current.compatibility.filter((item) => item !== value)
        : [...current.compatibility, value];
      return { ...current, compatibility };
    });
    setError(null);
  };

  const handleFileSelect = (file: File) => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleClearImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(savedImageUrl ?? existingImageUrl);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const purchasePrice = Number(form.purchasePrice);
    const publicPrice = Number(form.publicPrice);
    const stock = Number(form.stock);
    const min = Number(form.min);

    if (!form.internalCode.trim()) {
      setError("El código interno es obligatorio.");
      return;
    }

    if (!form.name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (!form.description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }

    if (!form.categoryId || !form.subcategoryId) {
      setError("Seleccioná categoría y subcategoría.");
      return;
    }

    if (!form.supplierId) {
      setError("Seleccioná un proveedor.");
      return;
    }

    if (form.compatibility.length === 0) {
      setError("Seleccioná al menos una compatibilidad.");
      return;
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      setError("El precio de compra debe ser mayor a 0.");
      return;
    }

    if (!Number.isFinite(publicPrice) || publicPrice <= 0) {
      setError("El precio público debe ser mayor a 0.");
      return;
    }

    if (publicPrice < purchasePrice) {
      setError("El precio público no puede ser menor al precio de compra.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      setError("El stock debe ser un número mayor o igual a 0.");
      return;
    }

    if (!Number.isFinite(min) || min < 0) {
      setError("El stock mínimo debe ser un número mayor o igual a 0.");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await resolveProductImageUrl({
        imageFile,
        existingUrl: product.imageUrl
      });

      const updated = await updateProduct(product.id, {
        internalCode: form.internalCode,
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,
        supplierId: form.supplierId,
        imageUrl,
        purchasePrice,
        publicPrice,
        stock,
        min,
        compatibility: form.compatibility
      });

      if (imageFile && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(null);
      setSavedImageUrl(imageUrl);
      setImagePreview(imageUrl);

      if (updated) {
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <ProductModalShell
          onSubmit={handleSubmit}
          title="Editar producto"
          description={`${product.id} · Actualizá la ficha del repuesto`}
          sidebar={
            <>
              <ProductImagePicker
                previewSrc={imagePreview}
                imageFile={imageFile}
                onFileSelect={handleFileSelect}
                onClear={handleClearImage}
                onInvalidFile={setError}
                inputId="edit-product-image-file"
                mode="edit"
                existingImageUrl={existingImageUrl}
              />

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Vista previa</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/45">Código</span>
                    <span className="truncate font-bold text-white">{form.internalCode || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/45">Stock</span>
                    <span className="font-bold text-white">{form.stock || "0"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/45">Margen</span>
                    <span className="font-bold text-emerald-300">
                      {previewMargin !== null ? `${previewMargin}%` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          }
          footer={
            <div className="space-y-3">
              {error ? (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Pencil />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          }
        >
          <ModalSection title="Identificación">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Código interno" htmlFor="edit-product-internal-code">
                <Input
                  id="edit-product-internal-code"
                  value={form.internalCode}
                  onChange={(event) =>
                    updateField("internalCode", event.target.value.toUpperCase())
                  }
                />
              </ModalField>
              <ModalField label="Nombre" htmlFor="edit-product-name" className="sm:col-span-2">
                <Input
                  id="edit-product-name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </ModalField>
              <ModalField label="Descripción" htmlFor="edit-product-description" className="sm:col-span-2">
                <Textarea
                  id="edit-product-description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </ModalField>
            </div>
          </ModalSection>

          <ModalSection title="Información">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ModalField label="Categoría" htmlFor="edit-product-category">
                <FormSelect
                  id="edit-product-category"
                  value={form.categoryId}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                >
                  {categories.map((category) => (
                    <FormSelectOption key={category.id} value={category.id}>
                      {category.name}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
              <ModalField label="Subcategoría" htmlFor="edit-product-subcategory">
                <FormSelect
                  id="edit-product-subcategory"
                  value={form.subcategoryId}
                  onChange={(event) => updateField("subcategoryId", event.target.value)}
                  disabled={subcategoryOptions.length === 0}
                >
                  {subcategoryOptions.map((subcategory) => (
                    <FormSelectOption key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
              <ModalField label="Proveedor" htmlFor="edit-product-supplier">
                <FormSelect
                  id="edit-product-supplier"
                  value={form.supplierId}
                  onChange={(event) => updateField("supplierId", event.target.value)}
                >
                  {suppliers.map((supplier) => (
                    <FormSelectOption key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-white/68">Compatibilidad</p>
              <div className="flex flex-wrap gap-2">
                {COMPATIBILITY_OPTIONS.map((option) => {
                  const active = form.compatibility.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleCompatibility(option)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                        active
                          ? "border-racing-red bg-racing-red/20 text-white shadow-glow"
                          : "border-white/10 bg-white/[0.04] text-white/52 hover:border-white/20 hover:text-white"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </ModalSection>

          <ModalSection title="Precios">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Precio compra" htmlFor="edit-product-purchase">
                <Input
                  id="edit-product-purchase"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={form.purchasePrice}
                  onChange={(event) => updateField("purchasePrice", event.target.value)}
                />
              </ModalField>
              <ModalField label="Precio público" htmlFor="edit-product-public">
                <Input
                  id="edit-product-public"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={form.publicPrice}
                  onChange={(event) => updateField("publicPrice", event.target.value)}
                />
              </ModalField>
            </div>
          </ModalSection>

          <ModalSection title="Inventario">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Stock actual" htmlFor="edit-product-stock">
                <Input
                  id="edit-product-stock"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                />
              </ModalField>
              <ModalField label="Stock mínimo" htmlFor="edit-product-min">
                <Input
                  id="edit-product-min"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.min}
                  onChange={(event) => updateField("min", event.target.value)}
                />
              </ModalField>
            </div>
            <p className="mt-3 text-xs text-white/42">
              Si modificás el stock, se registrará un ajuste automático en el historial del producto.
            </p>
          </ModalSection>
        </ProductModalShell>
    </Dialog>
  );
}
