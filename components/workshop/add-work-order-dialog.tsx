"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ClipboardPlus } from "lucide-react";

import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
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
import { WORKSHOP_MECHANICS } from "@/types/crm";

type AddWorkOrderDialogProps = {
  trigger?: React.ReactNode;
};

export function AddWorkOrderDialog({ trigger }: AddWorkOrderDialogProps) {
  const { customers, addWorkOrder, getMotorcyclesByCustomer } = useCrm();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [motorcycleId, setMotorcycleId] = useState("");
  const [problem, setProblem] = useState("");
  const [observations, setObservations] = useState("");
  const [mechanic, setMechanic] = useState<string>(WORKSHOP_MECHANICS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const motorcycleOptions = useMemo(
    () => (customerId ? getMotorcyclesByCustomer(customerId) : []),
    [customerId, getMotorcyclesByCustomer]
  );

  const resetForm = () => {
    setCustomerId(customers[0]?.id ?? "");
    setMotorcycleId("");
    setProblem("");
    setObservations("");
    setMechanic(WORKSHOP_MECHANICS[0]);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      const firstId = customers[0]?.id ?? "";
      setCustomerId(firstId);
      const motos = firstId ? getMotorcyclesByCustomer(firstId) : [];
      setMotorcycleId(motos[0]?.id ?? "");
      setProblem("");
      setObservations("");
      setMechanic(WORKSHOP_MECHANICS[0]);
      setError(null);
    }
  };

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const motos = getMotorcyclesByCustomer(id);
    setMotorcycleId(motos[0]?.id ?? "");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerId) {
      setError("Seleccioná un cliente.");
      return;
    }

    if (!problem.trim()) {
      setError("Describí el problema reportado.");
      return;
    }

    if (!mechanic) {
      setError("Asigná un mecánico.");
      return;
    }

    setSaving(true);
    try {
      await addWorkOrder({
        customerId,
        motorcycleId: motorcycleId || undefined,
        problem,
        observations: observations || undefined,
        mechanic
      });

      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la orden.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <ClipboardPlus /> Nueva orden
          </Button>
        )}
      </DialogTrigger>

      <form onSubmit={handleSubmit}>
        <ProductModalShell
          title="Nueva orden de trabajo"
          description="Registrá el ingreso al taller con cliente, moto opcional y diagnóstico inicial."
          sidebar={
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                  Estado inicial
                </p>
                <p className="mt-3 font-display text-lg font-bold text-white">En espera</p>
                <p className="mt-2 text-sm text-white/48">
                  La orden ingresa al pipeline y podés avanzar estados desde el detalle.
                </p>
              </div>

              {selectedCustomer ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    Cliente seleccionado
                  </p>
                  <p className="mt-2 font-display font-bold text-white">{selectedCustomer.name}</p>
                  <p className="text-sm text-white/48">{selectedCustomer.phone}</p>
                  <p className="mt-2 text-xs text-white/38">
                    {motorcycleOptions.length === 0
                      ? "Sin motos — orden sin unidad asignada"
                      : `${motorcycleOptions.length} moto(s) disponible(s)`}
                  </p>
                </div>
              ) : null}
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
                <Button type="submit">Crear orden</Button>
              </div>
            </div>
          }
        >
          <ModalSection title="Cliente y unidad">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Cliente" htmlFor="wo-customer">
                <FormSelect
                  id="wo-customer"
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <FormSelectOption value="" disabled>
                    Seleccionar cliente
                  </FormSelectOption>
                  {customers.map((customer) => (
                    <FormSelectOption key={customer.id} value={customer.id}>
                      {customer.name}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
              <ModalField label="Moto (opcional)" htmlFor="wo-motorcycle">
                <FormSelect
                  id="wo-motorcycle"
                  value={motorcycleId}
                  onChange={(e) => setMotorcycleId(e.target.value)}
                  disabled={motorcycleOptions.length === 0}
                >
                  <FormSelectOption value="">
                    {motorcycleOptions.length === 0 ? "Sin motos registradas" : "Sin asignar"}
                  </FormSelectOption>
                  {motorcycleOptions.map((moto) => (
                    <FormSelectOption key={moto.id} value={moto.id}>
                      {moto.brandModel} · {moto.plate}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
              <ModalField label="Mecánico asignado" htmlFor="wo-mechanic" className="sm:col-span-2">
                <FormSelect
                  id="wo-mechanic"
                  value={mechanic}
                  onChange={(e) => setMechanic(e.target.value)}
                >
                  {WORKSHOP_MECHANICS.map((name) => (
                    <FormSelectOption key={name} value={name}>
                      {name}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
            </div>
          </ModalSection>

          <ModalSection title="Diagnóstico inicial">
            <div className="space-y-4">
              <ModalField label="Problema reportado" htmlFor="wo-problem">
                <Textarea
                  id="wo-problem"
                  placeholder="Ej. Ruido en transmisión y tironeo en baja..."
                  value={problem}
                  onChange={(e) => { setProblem(e.target.value); setError(null); }}
                />
              </ModalField>
              <ModalField label="Observaciones (opcional)" htmlFor="wo-observations">
                <Textarea
                  id="wo-observations"
                  placeholder="Notas internas, condición de ingreso, repuestos sospechados..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </ModalField>
            </div>
          </ModalSection>
        </ProductModalShell>
      </form>
    </Dialog>
  );
}
