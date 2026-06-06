"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";

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
import type { Supplier } from "@/types/inventory";

type EditSupplierDialogProps = {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditSupplierDialog({ supplier, open, onOpenChange }: EditSupplierDialogProps) {
  const { updateSupplier } = useInventory();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supplier && open) {
      setName(supplier.name);
      setContact(supplier.contact ?? "");
      setPhone(supplier.phone ?? "");
      setEmail(supplier.email ?? "");
      setError(null);
    }
  }, [supplier, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supplier) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await updateSupplier(supplier.id, {
        name: trimmedName,
        contact: contact.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el proveedor.");
    } finally {
      setSaving(false);
    }
  };

  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-racing-red" />
            Editar proveedor
          </DialogTitle>
          <DialogDescription>Actualizá los datos de contacto del proveedor.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-supplier-name">Nombre</Label>
            <Input
              id="edit-supplier-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-supplier-contact">Contacto (opcional)</Label>
            <Input
              id="edit-supplier-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-supplier-phone">Teléfono</Label>
              <Input
                id="edit-supplier-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier-email">Email</Label>
              <Input
                id="edit-supplier-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
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
