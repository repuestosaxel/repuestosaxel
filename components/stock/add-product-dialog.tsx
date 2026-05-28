"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, PackagePlus } from "lucide-react";

import { ProductImage } from "@/components/stock/product-image";
import {
  ModalField,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/contexts/inventory-context";
import { DEFAULT_PRODUCT_IMAGE, getMarginPercent } from "@/lib/inventory";
import { cn, money } from "@/lib/utils";
import { COMPATIBILITY_OPTIONS, type CompatibilityType } from "@/types/inventory";

type AddProductDialogProps = {
  trigger?: React.ReactNode;
};

type FormState = {
  internalCode: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  supplierId: string;
  imageUrl: string;
  purchasePrice: string;
  publicPrice: string;
  stock: string;
  min: string;
  compatibility: CompatibilityType[];
};

const emptyForm: FormState = {
  internalCode: "",
  name: "",
  description: "",
  categoryId: "",
  subcategoryId: "",
  supplierId: "",
  imageUrl: "",
  purchasePrice: "",
  publicPrice: "",
  stock: "",
  min: "",
  compatibility: ["Motocicletas"]
};

export function AddProductDialog({ trigger }: AddProductDialogProps) {
  const { categories, suppliers, addProduct, getSubcategoriesByCategory } = useInventory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_PRODUCT_IMAGE);

  const subcategoryOptions = useMemo(
    () => (form.categoryId ? getSubcategoriesByCategory(form.categoryId) : []),
    [form.categoryId, getSubcategoriesByCategory]
  );

  const previewMargin = useMemo(() => {
    const purchase = Number(form.purchasePrice);
    const publicPrice = Number(form.publicPrice);
    if (!Number.isFinite(purchase) || !Number.isFinite(publicPrice) || purchase <= 0) return null;
    return getMarginPercent(purchase, publicPrice);
  }, [form.purchasePrice, form.publicPrice]);

  const resetForm = () => {
    const firstCategoryId = categories[0]?.id ?? "";
    const firstSubcategoryId = firstCategoryId
      ? getSubcategoriesByCategory(firstCategoryId)[0]?.id ?? ""
      : "";

    setForm({
      ...emptyForm,
      categoryId: firstCategoryId,
      subcategoryId: firstSubcategoryId,
      supplierId: suppliers[0]?.id ?? "",
      compatibility: ["Motocicletas"]
    });
    setImagePreview(DEFAULT_PRODUCT_IMAGE);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) resetForm();
  };

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleCategoryChange = (categoryId: string) => {
    const subs = getSubcategoriesByCategory(categoryId);
    setForm((current) => ({
      ...current,
      categoryId,
      subcategoryId: subs[0]?.id ?? ""
    }));
    setError(null);
  };

  const toggleCompatibility = (value: CompatibilityType) => {
    setForm((current) => {
      const exists = current.compatibility.includes(value);
      const compatibility = exists
        ? current.compatibility.filter((item) => item !== value)
        : [...current.compatibility, value];

      return { ...current, compatibility };
    });
    setError(null);
  };

  const handleImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : DEFAULT_PRODUCT_IMAGE;
      setImagePreview(result);
      updateField("imageUrl", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    addProduct({
      internalCode: form.internalCode,
      name: form.name,
      description: form.description,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId,
      supplierId: form.supplierId,
      imageUrl: form.imageUrl || DEFAULT_PRODUCT_IMAGE,
      purchasePrice,
      publicPrice,
      stock,
      min,
      compatibility: form.compatibility
    });

    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <PackagePlus /> Agregar producto
          </Button>
        )}
      </DialogTrigger>

      <form onSubmit={handleSubmit}>
        <ProductModalShell
          title="Nuevo producto"
          description="Completá la ficha del repuesto con la misma estructura del detalle de producto."
          sidebar={
            <>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="relative aspect-square">
                  <ProductImage src={imagePreview} alt="Vista previa del producto" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <ModalField label="URL de imagen" htmlFor="product-image-url">
                  <Input
                    id="product-image-url"
                    placeholder="https://..."
                    value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateField("imageUrl", value);
                      setImagePreview(value || DEFAULT_PRODUCT_IMAGE);
                    }}
                  />
                </ModalField>

                <ModalField label="O subir archivo" htmlFor="product-image-file">
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white/58 transition-colors hover:border-racing-red/40 hover:text-white">
                    <ImagePlus className="size-4 shrink-0 text-racing-red" />
                    <span>Seleccionar imagen local</span>
                    <input
                      id="product-image-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFile}
                    />
                  </label>
                </ModalField>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Vista previa</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/45">Código</span>
                    <span className="truncate font-bold text-white">
                      {form.internalCode || "—"}
                    </span>
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
                  {previewMargin !== null && form.purchasePrice && form.publicPrice ? (
                    <p className="pt-1 text-xs text-white/42">
                      {money(Number(form.purchasePrice))} → {money(Number(form.publicPrice))}
                    </p>
                  ) : null}
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
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar producto</Button>
              </div>
            </div>
          }
        >
          <ModalSection title="Identificación">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Código interno" htmlFor="product-internal-code">
                <Input
                  id="product-internal-code"
                  placeholder="Ej. MOT-5100-4T"
                  value={form.internalCode}
                  onChange={(event) =>
                    updateField("internalCode", event.target.value.toUpperCase())
                  }
                />
              </ModalField>
              <ModalField label="Nombre" htmlFor="product-name" className="sm:col-span-2">
                <Input
                  id="product-name"
                  placeholder="Ej. Aceite Motul 5100 15W50 4T"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </ModalField>
              <ModalField label="Descripción" htmlFor="product-description" className="sm:col-span-2">
                <Textarea
                  id="product-description"
                  placeholder="Detalle técnico, uso recomendado, observaciones..."
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </ModalField>
            </div>
          </ModalSection>

          <ModalSection title="Información">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ModalField label="Categoría" htmlFor="product-category">
                <FormSelect
                  id="product-category"
                  value={form.categoryId}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                >
                  <FormSelectOption value="" disabled>
                    Seleccionar
                  </FormSelectOption>
                  {categories.map((category) => (
                    <FormSelectOption key={category.id} value={category.id}>
                      {category.name}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
              <ModalField label="Subcategoría" htmlFor="product-subcategory">
                <FormSelect
                  id="product-subcategory"
                  value={form.subcategoryId}
                  onChange={(event) => updateField("subcategoryId", event.target.value)}
                  disabled={subcategoryOptions.length === 0}
                >
                  <FormSelectOption value="" disabled>
                    {subcategoryOptions.length === 0 ? "Sin subcategorías" : "Seleccionar"}
                  </FormSelectOption>
                  {subcategoryOptions.map((subcategory) => (
                    <FormSelectOption key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
              <ModalField label="Proveedor" htmlFor="product-supplier">
                <FormSelect
                  id="product-supplier"
                  value={form.supplierId}
                  onChange={(event) => updateField("supplierId", event.target.value)}
                >
                  <FormSelectOption value="" disabled>
                    Seleccionar
                  </FormSelectOption>
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
              <ModalField label="Precio compra" htmlFor="product-purchase">
                <Input
                  id="product-purchase"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="32000"
                  value={form.purchasePrice}
                  onChange={(event) => updateField("purchasePrice", event.target.value)}
                />
              </ModalField>
              <ModalField label="Precio público" htmlFor="product-public">
                <Input
                  id="product-public"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="48000"
                  value={form.publicPrice}
                  onChange={(event) => updateField("publicPrice", event.target.value)}
                />
              </ModalField>
            </div>
          </ModalSection>

          <ModalSection title="Inventario">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Stock actual" htmlFor="product-stock">
                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                />
              </ModalField>
              <ModalField label="Stock mínimo" htmlFor="product-min">
                <Input
                  id="product-min"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  value={form.min}
                  onChange={(event) => updateField("min", event.target.value)}
                />
              </ModalField>
            </div>
          </ModalSection>
        </ProductModalShell>
      </form>
    </Dialog>
  );
}
