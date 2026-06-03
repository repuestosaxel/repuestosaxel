"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";

import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import {
  ModalInfoBlock,
  ModalPriceBlock,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useCrm } from "@/contexts/crm-context";
import { useSaleOperations } from "@/hooks/use-sale-operations";
import { getSaleItemsSummary } from "@/lib/sales";
import { money } from "@/lib/utils";
import { SALE_STATUSES, type Sale, type SaleStatus } from "@/types/sales";

type SaleDetailDialogProps = {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SaleDetailDialog({ sale, open, onOpenChange }: SaleDetailDialogProps) {
  const { getCustomerById } = useCrm();
  const { changeSaleStatus } = useSaleOperations();
  const [status, setStatus] = useState<SaleStatus>("Pagado");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!sale) return null;

  const customer = sale.customerId ? getCustomerById(sale.customerId) : undefined;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStatus(sale.status);
      setError(null);
    }
    onOpenChange(next);
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    const result = await changeSaleStatus(sale.id, status);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ProductModalShell
        title={`Venta ${sale.reference}`}
        description={getSaleItemsSummary(sale.items)}
        sidebar={
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Estado</p>
              <div className="mt-3">
                <StatusBadge status={sale.status} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-racing-red/25 bg-racing-red/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Total</p>
              <p className="mt-2 font-display text-3xl font-black text-white">{money(sale.total)}</p>
              <p className="mt-2 text-sm text-white/58">{sale.paymentMethod}</p>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/58">
              <p className="inline-flex items-center gap-2">
                <ReceiptText className="size-4 text-racing-red" />
                {sale.createdAt}
              </p>
              <p>Cliente: {customer?.name ?? sale.customerName ?? "Mostrador"}</p>
              <p>ID interno: {sale.id}</p>
            </div>
          </>
        }
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ModalFieldStatus status={status} onChange={setStatus} current={sale.status} />
            <Button onClick={handleSaveStatus}>Guardar estado</Button>
          </div>
        }
      >
        <ModalSection title="Información">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <ModalInfoBlock
              label="Cliente"
              value={customer?.name ?? sale.customerName ?? "Mostrador"}
              sub={sale.customerId}
            />
            <ModalInfoBlock label="Fecha" value={sale.createdAt} />
            <ModalInfoBlock label="Método de pago" value={sale.paymentMethod} />
          </div>
        </ModalSection>

        <ModalSection title="Productos vendidos">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-white/42">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Cant.</th>
                  <th className="px-4 py-3">P. unitario</th>
                  <th className="px-4 py-3">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{item.productName}</p>
                      <p className="text-xs text-racing-red">{item.internalCode}</p>
                    </td>
                    <td className="px-4 py-3 font-display font-bold text-white">{item.quantity}</td>
                    <td className="px-4 py-3 text-white/64">{money(item.unitPrice)}</td>
                    <td className="px-4 py-3 font-semibold text-white">{money(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 bg-white/[0.03]">
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] text-white/40"
                  >
                    Total final
                  </td>
                  <td className="px-4 py-3 font-display text-lg font-bold text-racing-red">
                    {money(sale.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ModalSection>

        <div className="grid gap-4 sm:grid-cols-2">
          <ModalPriceBlock label="Subtotal productos" value={money(sale.subtotal)} tone="muted" />
          <ModalPriceBlock label="Total cobrado" value={money(sale.total)} tone="accent" />
        </div>

        {sale.notes ? (
          <ModalSection title="Notas">
            <p className="text-sm leading-7 text-white/68">{sale.notes}</p>
          </ModalSection>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </ProductModalShell>
    </Dialog>
  );
}

function ModalFieldStatus({
  status,
  onChange,
  current
}: {
  status: SaleStatus;
  onChange: (value: SaleStatus) => void;
  current: SaleStatus;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="text-sm text-white/48">
        Estado actual: <StatusBadge status={current} />
      </span>
      <FormSelect value={status} onChange={(event) => onChange(event.target.value as SaleStatus)}>
        {SALE_STATUSES.map((item) => (
          <FormSelectOption key={item} value={item}>
            {item}
          </FormSelectOption>
        ))}
      </FormSelect>
    </div>
  );
}
