"use client";

import { useMemo, useState } from "react";
import { PackagePlus, PackageSearch } from "lucide-react";

import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import { ModalField, ModalSection } from "@/components/stock/product-modal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkOrderOperations } from "@/hooks/use-work-order-operations";
import { canAddPartsToWorkOrder, getWorkOrderPartsTotal } from "@/lib/crm";
import { money } from "@/lib/utils";
import type { WorkOrder, WorkOrderStatus } from "@/types/crm";

type WorkOrderPartsPanelProps = {
  order: WorkOrder;
  status: WorkOrderStatus;
};

export function WorkOrderPartsPanel({ order, status }: WorkOrderPartsPanelProps) {
  const { addPartToWorkOrder, availableProducts } = useWorkOrderOperations();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const canAdd = canAddPartsToWorkOrder(order.status);
  const pendingStatusSave =
    !canAdd && canAddPartsToWorkOrder(status) && status !== order.status;
  const partsTotal = getWorkOrderPartsTotal(order.parts);

  const selectedProduct = useMemo(
    () => availableProducts.find((product) => product.id === productId),
    [availableProducts, productId]
  );

  const handleAdd = async () => {
    const qty = Number(quantity);
    if (!productId) {
      setError("Seleccioná un producto del inventario.");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }

    setAdding(true);
    const result = await addPartToWorkOrder(order.id, productId, qty);
    setAdding(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setQuantity("1");
    setProductId("");
  };

  return (
    <ModalSection title="Repuestos utilizados">
      {!canAdd ? (
        <div className="rounded-2xl border border-dashed border-amber-500/25 bg-amber-500/5 px-4 py-6 text-sm leading-6 text-amber-100/80">
          {pendingStatusSave ? (
            <>
              Guardá el cambio de estado a <strong className="text-white">{status}</strong> para
              poder cargar repuestos del inventario.
            </>
          ) : (
            <>
              Los repuestos del inventario pueden cargarse cuando la orden pase a{" "}
              <strong className="text-white">En reparación</strong> o estados posteriores.
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Agregar desde inventario
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
              <ModalField label="Producto">
                <FormSelect
                  value={productId}
                  onChange={(event) => {
                    setProductId(event.target.value);
                    setError(null);
                  }}
                >
                  <FormSelectOption value="" disabled>
                    Seleccionar producto
                  </FormSelectOption>
                  {availableProducts.map((product) => (
                    <FormSelectOption key={product.id} value={product.id}>
                      {product.name} · Stock {product.stock}
                    </FormSelectOption>
                  ))}
                </FormSelect>
              </ModalField>
              <ModalField label="Cantidad">
                <Input
                  type="number"
                  min={1}
                  max={selectedProduct?.stock ?? undefined}
                  value={quantity}
                  onChange={(event) => {
                    setQuantity(event.target.value);
                    setError(null);
                  }}
                />
              </ModalField>
              <div className="flex items-end">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={adding || availableProducts.length === 0}
                  onClick={handleAdd}
                >
                  <PackagePlus />
                  Agregar
                </Button>
              </div>
            </div>
            {selectedProduct ? (
              <p className="mt-3 text-xs text-white/42">
                Precio público unitario: {money(selectedProduct.publicPrice)} · Código{" "}
                {selectedProduct.internalCode}
              </p>
            ) : null}
            {availableProducts.length === 0 ? (
              <p className="mt-3 text-xs text-amber-200/80">
                No hay productos con stock disponible en inventario.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {order.parts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/42">
          <PackageSearch className="mx-auto mb-2 size-5 text-white/30" />
          Sin repuestos cargados en esta orden.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
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
              {order.parts.map((part) => (
                <tr key={part.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{part.productName}</p>
                    <p className="text-xs text-racing-red">{part.internalCode}</p>
                  </td>
                  <td className="px-4 py-3 font-display font-bold text-white">{part.quantity}</td>
                  <td className="px-4 py-3 text-white/64">{money(part.unitPrice)}</td>
                  <td className="px-4 py-3 font-semibold text-white">{money(part.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-white/[0.03]">
                <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  Total repuestos
                </td>
                <td className="px-4 py-3 font-display text-lg font-bold text-racing-red">
                  {money(partsTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </ModalSection>
  );
}
