"use client";

import { useEffect, useState } from "react";
import { Bike, Calendar, UserRound, Wrench } from "lucide-react";

import {
  ModalField,
  ModalInfoBlock,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { WorkOrderBillingPanel } from "@/components/workshop/work-order-billing-panel";
import { WorkOrderPartsPanel } from "@/components/workshop/work-order-parts-panel";
import { WorkOrderStatusBadge } from "@/components/workshop/work-order-status-badge";
import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/contexts/crm-context";
import {
  getWorkOrderGrandTotal,
  getWorkOrderPartsTotal,
  getWorkOrderProgress
} from "@/lib/crm";
import { cn, money } from "@/lib/utils";
import type { WorkOrder, WorkOrderStatus } from "@/types/crm";
import { WORK_ORDER_STATUSES, WORKSHOP_MECHANICS } from "@/types/crm";

type WorkOrderDetailDialogProps = {
  order: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WorkOrderDetailDialog({ order, open, onOpenChange }: WorkOrderDetailDialogProps) {
  const { getCustomerById, getMotorcycleById, updateWorkOrder } = useCrm();
  const [observations, setObservations] = useState("");
  const [mechanic, setMechanic] = useState("");
  const [status, setStatus] = useState<WorkOrderStatus>("En espera");
  const [laborCost, setLaborCost] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const syncFromOrder = (current: WorkOrder) => {
    setObservations(current.observations ?? "");
    setMechanic(current.mechanic);
    setStatus(current.status);
    setLaborCost(current.laborCost !== undefined ? String(current.laborCost) : "");
    setSaved(false);
  };

  useEffect(() => {
    if (order) syncFromOrder(order);
  }, [order]);

  if (!order) return null;

  const customer = getCustomerById(order.customerId);
  const motorcycle = order.motorcycleId ? getMotorcycleById(order.motorcycleId) : undefined;
  const progress = getWorkOrderProgress(status);
  const statusIndex = WORK_ORDER_STATUSES.indexOf(status);
  const partsTotal = getWorkOrderPartsTotal(order.parts);
  const laborValue = Number(laborCost);
  const laborAmount = Number.isFinite(laborValue) && laborValue >= 0 ? laborValue : 0;
  const grandTotal = getWorkOrderGrandTotal(partsTotal, laborAmount);

  const handleOpenChange = (next: boolean) => {
    if (next) syncFromOrder(order);
    onOpenChange(next);
  };

  const handleSave = async () => {
    const parsedLabor = laborCost.trim() === "" ? undefined : Number(laborCost);

    if (parsedLabor !== undefined && (!Number.isFinite(parsedLabor) || parsedLabor < 0)) {
      return;
    }

    setSaving(true);
    try {
      await updateWorkOrder(order.id, {
        status,
        observations,
        mechanic,
        laborCost: parsedLabor
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ProductModalShell
        title={`Orden ${order.id}`}
        description={motorcycle ? `${motorcycle.brandModel} · ${motorcycle.plate}` : "Sin moto asignada"}
        sidebar={
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Estado</p>
              <div className="mt-3">
                <WorkOrderStatusBadge status={status} />
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-white/45">Avance</span>
                  <span className="font-display font-bold text-white">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Costos</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Repuestos</span>
                  <span className="font-bold text-white">{money(partsTotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Mano de obra</span>
                  <span className="font-bold text-white">{money(laborAmount)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                  <span className="text-white/58">Total</span>
                  <span className="font-display font-bold text-racing-red">{money(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/58">
              <p className="inline-flex items-center gap-2">
                <UserRound className="size-4 text-racing-red" />
                {customer?.name ?? "—"}
              </p>
              {motorcycle ? (
                <p className="inline-flex items-center gap-2">
                  <Bike className="size-4 text-racing-red" />
                  {motorcycle.brandModel}
                </p>
              ) : null}
              <p className="inline-flex items-center gap-2">
                <Wrench className="size-4 text-racing-red" />
                {order.mechanic}
              </p>
              <p className="inline-flex items-center gap-2">
                <Calendar className="size-4 text-racing-red" />
                Ingreso: {order.createdAt}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-0.5">
              {WORK_ORDER_STATUSES.map((step, stepIndex) => {
                const active = stepIndex <= statusIndex;
                return (
                  <div key={step} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={cn(
                        "size-2.5 rounded-full border",
                        active ? "border-racing-red bg-racing-red" : "border-white/16 bg-white/8"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </>
        }
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {saved ? (
              <p className="text-sm text-emerald-300">Cambios guardados correctamente.</p>
            ) : (
              <p className="text-sm text-white/42">
                Guardá estado, repuestos, mano de obra y observaciones.
              </p>
            )}
            <Button onClick={handleSave}>Guardar cambios</Button>
          </div>
        }
      >
        <ModalSection title="Problema reportado">
          <p className="text-sm leading-7 text-white/70">{order.problem}</p>
        </ModalSection>

        <ModalSection title="Información">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <ModalInfoBlock label="Cliente" value={customer?.name ?? "—"} sub={customer?.id} />
            <ModalInfoBlock
              label="Moto"
              value={motorcycle?.brandModel ?? "Sin asignar"}
              sub={motorcycle?.plate}
            />
            <ModalInfoBlock label="Última actualización" value={order.updatedAt} />
          </div>
        </ModalSection>

        <WorkOrderPartsPanel order={order} status={status} />

        <WorkOrderBillingPanel
          status={status}
          partsTotal={partsTotal}
          laborCost={laborCost}
          onLaborCostChange={setLaborCost}
        />

        <ModalSection title="Gestión de la orden">
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Estado">
              <FormSelect value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}>
                {WORK_ORDER_STATUSES.map((item) => (
                  <FormSelectOption key={item} value={item}>
                    {item}
                  </FormSelectOption>
                ))}
              </FormSelect>
            </ModalField>
            <ModalField label="Mecánico">
              <FormSelect value={mechanic} onChange={(e) => setMechanic(e.target.value)}>
                {WORKSHOP_MECHANICS.map((name) => (
                  <FormSelectOption key={name} value={name}>
                    {name}
                  </FormSelectOption>
                ))}
              </FormSelect>
            </ModalField>
            <ModalField label="Observaciones" className="sm:col-span-2">
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Notas de diagnóstico, pruebas, entrega..."
              />
            </ModalField>
          </div>
        </ModalSection>

        <ModalSection title="Pipeline de estados">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {WORK_ORDER_STATUSES.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left text-sm transition-all",
                  status === item
                    ? "border-racing-red bg-racing-red/15 text-white shadow-glow"
                    : "border-white/10 bg-white/[0.03] text-white/58 hover:border-white/20"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">
                  Paso {index + 1}
                </span>
                <p className="mt-1 font-semibold">{item}</p>
              </button>
            ))}
          </div>
        </ModalSection>
      </ProductModalShell>
    </Dialog>
  );
}
