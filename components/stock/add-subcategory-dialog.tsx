"use client";

import { useState, type FormEvent } from "react";
import { Layers2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import { useInventory } from "@/contexts/inventory-context";

export function AddSubcategoryDialog() {
  const { categories, addSubcategory } = useInventory();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setCategoryId(categories[0]?.id ?? "");
    setName("");
    setDescription("");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) resetForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      await addSubcategory({
        categoryId,
        name: trimmedName,
        description: description.trim() || undefined
      });

      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la subcategoría.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Layers2 /> Nueva subcategoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva subcategoría</DialogTitle>
          <DialogDescription>
            Tabla independiente vinculada a una categoría por relación (categoryId).
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="subcategory-category">Categoría padre</Label>
            <FormSelect
              id="subcategory-category"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setError(null);
              }}
            >
              <FormSelectOption value="" disabled>
                Seleccionar categoría
              </FormSelectOption>
              {categories.map((category) => (
                <FormSelectOption key={category.id} value={category.id}>
                  {category.name}
                </FormSelectOption>
              ))}
            </FormSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory-name">Nombre</Label>
            <Input
              id="subcategory-name"
              placeholder="Ej. Aceites 2T"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory-description">Descripción (opcional)</Label>
            <Input
              id="subcategory-description"
              placeholder="Breve descripción"
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
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar subcategoría</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
