"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";

import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventory } from "@/contexts/inventory-context";
import type { Subcategory } from "@/types/inventory";

type EditSubcategoryDialogProps = {
  subcategory: Subcategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditSubcategoryDialog({
  subcategory,
  open,
  onOpenChange
}: EditSubcategoryDialogProps) {
  const { categories, updateSubcategory } = useInventory();
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subcategory && open) {
      setCategoryId(subcategory.categoryId);
      setName(subcategory.name);
      setDescription(subcategory.description ?? "");
      setError(null);
    }
  }, [subcategory, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subcategory) return;

    if (!categoryId) {
      setError("Seleccioná una categoría padre.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre de la subcategoría es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await updateSubcategory(subcategory.id, {
        categoryId,
        name: trimmedName,
        description: description.trim() || undefined
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la subcategoría.");
    } finally {
      setSaving(false);
    }
  };

  if (!subcategory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-racing-red" />
            Editar subcategoría
          </DialogTitle>
          <DialogDescription>
            Podés cambiar la categoría padre, el nombre o la descripción.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-subcategory-category">Categoría padre</Label>
            <FormSelect
              id="edit-subcategory-category"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setError(null);
              }}
            >
              {categories.map((category) => (
                <FormSelectOption key={category.id} value={category.id}>
                  {category.name}
                </FormSelectOption>
              ))}
            </FormSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subcategory-name">Nombre</Label>
            <Input
              id="edit-subcategory-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subcategory-description">Descripción (opcional)</Label>
            <Input
              id="edit-subcategory-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
