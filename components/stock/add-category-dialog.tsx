"use client";

import { useState, type FormEvent } from "react";
import { FolderPlus } from "lucide-react";

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
import { useInventory } from "@/contexts/inventory-context";

export function AddCategoryDialog() {
  const { addCategory } = useInventory();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await addCategory({
        name: trimmedName,
        description: description.trim() || undefined
      });

      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <FolderPlus /> Nueva categoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>
            Las categorías son entidades independientes. Los productos se vinculan a ellas por relación.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              placeholder="Ej. Electrónica"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Descripción (opcional)</Label>
            <Input
              id="category-description"
              placeholder="Breve descripción de la categoría"
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
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar categoría"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
