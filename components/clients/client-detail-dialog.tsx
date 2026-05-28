"use client";

import { Bike, Mail, Phone, ShoppingBag, Wrench } from "lucide-react";

import { AccountBalanceBadge } from "@/components/clients/account-balance-badge";
import {
  ModalInfoBlock,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { WorkOrderStatusBadge } from "@/components/workshop/work-order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useCrm } from "@/contexts/crm-context";
import { getAccountBalanceLabel, getAccountBalanceState } from "@/lib/crm";
import { money } from "@/lib/utils";
import type { Customer } from "@/types/crm";

type ClientDetailDialogProps = {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientDetailDialog({ customer, open, onOpenChange }: ClientDetailDialogProps) {
  const {
    getMotorcyclesByCustomer,
    getSalesByCustomer,
    getWorkOrdersByCustomer
  } = useCrm();

  if (!customer) return null;

  const motorcycles = getMotorcyclesByCustomer(customer.id);
  const sales = getSalesByCustomer(customer.id);
  const workOrders = getWorkOrdersByCustomer(customer.id);
  const balanceState = getAccountBalanceState(customer.balance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ProductModalShell
        title={customer.name}
        description={`${customer.id} · Cliente desde ${customer.createdAt}`}
        sidebar={
          <>
            <div className="flex size-20 items-center justify-center rounded-2xl border border-racing-red/35 bg-racing-red/10 font-display text-3xl font-black text-racing-red">
              {customer.name.split(" ").map((name) => name.charAt(0)).join("")}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <ContactRow icon={Phone} value={customer.phone} />
              {customer.email ? <ContactRow icon={Mail} value={customer.email} /> : null}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                Cuenta corriente
              </p>
              <div className="mt-3">
                <AccountBalanceBadge customer={customer} showAmount={false} />
              </div>
              {customer.accountEnabled ? (
                <p className="mt-3 font-display text-2xl font-bold text-white">
                  {balanceState === "debt"
                    ? `-${money(Math.abs(customer.balance))}`
                    : balanceState === "credit"
                      ? money(customer.balance)
                      : money(0)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-white/42">{getAccountBalanceLabel(customer)}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <SidebarStat label="Motos" value={motorcycles.length} />
              <SidebarStat label="Compras" value={sales.length} />
              <SidebarStat label="Órdenes" value={workOrders.length} />
            </div>
          </>
        }
      >
        {customer.notes ? (
          <ModalSection title="Notas">
            <p className="text-sm leading-7 text-white/68">{customer.notes}</p>
          </ModalSection>
        ) : null}

        <ModalSection title="Información">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <ModalInfoBlock label="Última visita" value={customer.lastVisit ?? "—"} />
            <ModalInfoBlock
              label="Tipo de cliente"
              value={motorcycles.length === 0 ? "Solo repuestos" : "Taller + repuestos"}
            />
            <ModalInfoBlock
              label="Cuenta corriente"
              value={customer.accountEnabled ? "Habilitada" : "No habilitada"}
            />
          </div>
        </ModalSection>

        <ModalSection
          title="Motos registradas"
          action={
            <Badge variant="outline">
              {motorcycles.length} unidad{motorcycles.length === 1 ? "" : "es"}
            </Badge>
          }
        >
          {motorcycles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/42">
              Sin motos asociadas. Este cliente opera solo en mostrador de repuestos.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {motorcycles.map((moto) => (
                <div
                  key={moto.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                      <Bike className="size-4 text-racing-red" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{moto.brandModel}</p>
                      <p className="text-sm text-racing-red">{moto.plate}</p>
                      <p className="text-xs text-white/38">{moto.id}</p>
                      {moto.year ? (
                        <p className="mt-1 text-xs text-white/42">Año {moto.year}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalSection>

        <ModalSection
          title="Historial de compras"
          action={<Badge variant="outline">{sales.length} ventas</Badge>}
        >
          {sales.length === 0 ? (
            <EmptyHistory message="Sin compras registradas." />
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="size-4 text-racing-red" />
                      <p className="font-display text-sm font-bold text-white">{sale.reference}</p>
                      <StatusBadge status={sale.status} />
                    </div>
                    <p className="font-display font-bold text-white">{money(sale.amount)}</p>
                  </div>
                  <p className="mt-2 text-sm text-white/58">{sale.items}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/40">
                    <span>{sale.date}</span>
                    <span>{sale.method}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalSection>

        <ModalSection
          title="Órdenes de taller"
          action={<Badge variant="outline">{workOrders.length} órdenes</Badge>}
        >
          {workOrders.length === 0 ? (
            <EmptyHistory message="Sin órdenes de taller." />
          ) : (
            <div className="space-y-3">
              {workOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="size-4 text-racing-red" />
                      <p className="font-display text-sm font-bold text-white">{order.id}</p>
                      <WorkOrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-white/40">{order.updatedAt}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{order.problem}</p>
                  <p className="mt-2 text-xs text-white/38">Mecánico: {order.mechanic}</p>
                </div>
              ))}
            </div>
          )}
        </ModalSection>
      </ProductModalShell>
    </Dialog>
  );
}

function ContactRow({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-white/68">
      <Icon className="size-4 shrink-0 text-racing-red" />
      <span className="break-all">{value}</span>
    </p>
  );
}

function SidebarStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2.5">
      <p className="font-display text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/38">{label}</p>
    </div>
  );
}

function EmptyHistory({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/42">
      {message}
    </div>
  );
}
