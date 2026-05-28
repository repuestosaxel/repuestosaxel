"use client";

import { ModalField, ModalPriceBlock, ModalSection } from "@/components/stock/product-modal-shell";
import { Input } from "@/components/ui/input";
import {
  canEditLaborCost,
  getWorkOrderGrandTotal,
  getWorkOrderPartsTotal
} from "@/lib/crm";
import { money } from "@/lib/utils";
import type { WorkOrderStatus } from "@/types/crm";

type WorkOrderBillingPanelProps = {
  status: WorkOrderStatus;
  partsTotal: number;
  laborCost: string;
  onLaborCostChange: (value: string) => void;
};

export function WorkOrderBillingPanel({
  status,
  partsTotal,
  laborCost,
  onLaborCostChange
}: WorkOrderBillingPanelProps) {
  const canEdit = canEditLaborCost(status);
  const laborValue = Number(laborCost);
  const laborAmount = Number.isFinite(laborValue) && laborValue >= 0 ? laborValue : 0;
  const grandTotal = getWorkOrderGrandTotal(partsTotal, laborAmount);

  if (!canEdit) {
    return (
      <ModalSection title="Costo final de reparación">
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm leading-6 text-white/48">
          Al pasar la orden a <strong className="text-white/72">Finalizado</strong> o{" "}
          <strong className="text-white/72">Entregado</strong> podrás cargar mano de obra y ver el
          total final (repuestos + mano de obra).
        </div>
      </ModalSection>
    );
  }

  return (
    <ModalSection title="Costo final de reparación">
      <div className="grid gap-4 sm:grid-cols-3">
        <ModalPriceBlock label="Total repuestos" value={money(partsTotal)} tone="muted" />
        <ModalField label="Mano de obra">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={laborCost}
            onChange={(event) => onLaborCostChange(event.target.value)}
          />
        </ModalField>
        <ModalPriceBlock
          label="Total reparación"
          value={money(grandTotal)}
          sub="Repuestos + mano de obra"
          tone="accent"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-racing-red/25 bg-racing-red/10 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              Desglose final
            </p>
            <p className="mt-1 text-sm text-white/58">
              {money(partsTotal)} repuestos + {money(laborAmount)} mano de obra
            </p>
          </div>
          <p className="font-display text-2xl font-black text-white">{money(grandTotal)}</p>
        </div>
      </div>
    </ModalSection>
  );
}
