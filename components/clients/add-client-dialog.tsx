"use client";

import { useState, type FormEvent } from "react";
import { Bike, Plus, Trash2, UserPlus } from "lucide-react";

import {
  ModalField,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/contexts/crm-context";
import { cn } from "@/lib/utils";
import type { CreateMotorcycleInput } from "@/types/crm";

type AddClientDialogProps = {
  trigger?: React.ReactNode;
};

type MotoForm = CreateMotorcycleInput & { key: string };

const emptyMoto = (): MotoForm => ({
  key: `moto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  brandModel: "",
  plate: "",
  year: undefined,
  notes: ""
});

export function AddClientDialog({ trigger }: AddClientDialogProps) {
  const { addCustomer } = useCrm();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [accountEnabled, setAccountEnabled] = useState(false);
  const [initialBalance, setInitialBalance] = useState("");
  const [motorcycles, setMotorcycles] = useState<MotoForm[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setAccountEnabled(false);
    setInitialBalance("");
    setMotorcycles([]);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) resetForm();
  };

  const updateMoto = (key: string, field: keyof CreateMotorcycleInput, value: string) => {
    setMotorcycles((current) =>
      current.map((moto) =>
        moto.key === key
          ? {
              ...moto,
              [field]: field === "year" ? (value ? Number(value) : undefined) : value
            }
          : moto
      )
    );
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!phone.trim()) {
      setError("El teléfono es obligatorio.");
      return;
    }

    const validMotorcycles = motorcycles.filter((m) => m.brandModel.trim() && m.plate.trim());
    const incomplete = motorcycles.some(
      (m) => (m.brandModel.trim() && !m.plate.trim()) || (!m.brandModel.trim() && m.plate.trim())
    );

    if (incomplete) {
      setError("Completá marca/modelo y patente de cada moto o eliminá la fila.");
      return;
    }

    let balance = 0;
    if (accountEnabled) {
      balance = Number(initialBalance);
      if (!Number.isFinite(balance)) {
        setError("El saldo inicial debe ser un número válido.");
        return;
      }
    }

    addCustomer({
      name,
      phone,
      email: email || undefined,
      notes: notes || undefined,
      accountEnabled,
      initialBalance: accountEnabled ? balance : 0,
      motorcycles:
        validMotorcycles.length > 0
          ? validMotorcycles.map(({ brandModel, plate, year, notes: motoNotes }) => ({
              brandModel,
              plate,
              year,
              notes: motoNotes
            }))
          : undefined
    });

    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus /> Nuevo cliente
          </Button>
        )}
      </DialogTrigger>

      <form onSubmit={handleSubmit}>
        <ProductModalShell
          title="Nuevo cliente"
          description="La moto es opcional. Podés registrar clientes de mostrador o con varias unidades para taller."
          sidebar={
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                  Cuenta corriente
                </p>
                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm text-white/68">Habilitar cuenta</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={accountEnabled}
                    onClick={() => setAccountEnabled((v) => !v)}
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors",
                      accountEnabled ? "bg-racing-red" : "bg-white/15"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-6 rounded-full bg-white transition-transform",
                        accountEnabled ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                </label>
                {accountEnabled ? (
                  <div className="mt-4 space-y-2">
                    <ModalField label="Saldo inicial" htmlFor="initial-balance">
                      <Input
                        id="initial-balance"
                        type="number"
                        placeholder="0 (negativo = deuda, positivo = a favor)"
                        value={initialBalance}
                        onChange={(e) => {
                          setInitialBalance(e.target.value);
                          setError(null);
                        }}
                      />
                    </ModalField>
                    <p className="text-xs leading-5 text-white/42">
                      Usá valores negativos si el cliente debe dinero, o positivos si tiene saldo a favor.
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-white/48">
                    Sin cuenta corriente. Solo compras contado o medios de pago directos.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Motos</p>
                <p className="mt-2 text-sm text-white/48">
                  {motorcycles.length === 0
                    ? "Opcional — cliente de solo repuestos"
                    : `${motorcycles.length} moto(s) a registrar`}
                </p>
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
                <Button type="submit">Guardar cliente</Button>
              </div>
            </div>
          }
        >
          <ModalSection title="Datos personales">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Nombre completo" htmlFor="client-name">
                <Input
                  id="client-name"
                  placeholder="Ej. Matías Ferreyra"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                />
              </ModalField>
              <ModalField label="Teléfono" htmlFor="client-phone">
                <Input
                  id="client-phone"
                  placeholder="+54 9 11 ..."
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(null); }}
                />
              </ModalField>
              <ModalField label="Email (opcional)" htmlFor="client-email" className="sm:col-span-2">
                <Input
                  id="client-email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </ModalField>
              <ModalField label="Notas (opcional)" htmlFor="client-notes" className="sm:col-span-2">
                <Textarea
                  id="client-notes"
                  placeholder="Preferencias, observaciones comerciales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </ModalField>
            </div>
          </ModalSection>

          <ModalSection
            title="Motos asociadas (opcional)"
            action={
              <Button type="button" size="sm" variant="secondary" onClick={() => setMotorcycles((c) => [...c, emptyMoto()])}>
                <Plus /> Agregar moto
              </Button>
            }
          >
            {motorcycles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/42">
                Sin motos registradas. Ideal para clientes que solo compran repuestos en mostrador.
              </div>
            ) : (
              <div className="space-y-3">
                {motorcycles.map((moto) => (
                  <div
                    key={moto.key}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/68">
                        <Bike className="size-4 text-racing-red" /> Unidad
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setMotorcycles((c) => c.filter((m) => m.key !== moto.key))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ModalField label="Marca y modelo">
                        <Input
                          placeholder="Yamaha FZ 2.0"
                          value={moto.brandModel}
                          onChange={(e) => updateMoto(moto.key, "brandModel", e.target.value)}
                        />
                      </ModalField>
                      <ModalField label="Patente">
                        <Input
                          placeholder="A184KLM"
                          value={moto.plate}
                          onChange={(e) => updateMoto(moto.key, "plate", e.target.value.toUpperCase())}
                        />
                      </ModalField>
                      <ModalField label="Año (opcional)">
                        <Input
                          type="number"
                          placeholder="2022"
                          value={moto.year ?? ""}
                          onChange={(e) => updateMoto(moto.key, "year", e.target.value)}
                        />
                      </ModalField>
                      <ModalField label="Notas (opcional)">
                        <Input
                          placeholder="Observaciones de la unidad"
                          value={moto.notes ?? ""}
                          onChange={(e) => updateMoto(moto.key, "notes", e.target.value)}
                        />
                      </ModalField>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalSection>
        </ProductModalShell>
      </form>
    </Dialog>
  );
}
