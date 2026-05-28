"use client";

import { Bike, Mail, Phone, ShoppingBag, UserRound, Wrench } from "lucide-react";

import { AccountBalanceBadge } from "@/components/clients/account-balance-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCrm } from "@/contexts/crm-context";
import type { Customer } from "@/types/crm";

type ClientCardProps = {
  customer: Customer;
  onView: (customer: Customer) => void;
};

export function ClientCard({ customer, onView }: ClientCardProps) {
  const { getMotorcyclesByCustomer, getSalesByCustomer, getWorkOrdersByCustomer } = useCrm();
  const motorcycles = getMotorcyclesByCustomer(customer.id);
  const sales = getSalesByCustomer(customer.id);
  const orders = getWorkOrdersByCustomer(customer.id);
  const activeOrders = orders.filter((o) => o.status !== "Entregado");

  return (
    <Card
      className="cursor-pointer p-5 transition-all hover:border-racing-red/45 hover:shadow-glow"
      onClick={() => onView(customer)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-racing-red/30 bg-racing-red/10 font-display text-lg font-bold text-racing-red">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">{customer.name}</h3>
            <p className="mt-1 text-xs text-white/40">{customer.id}</p>
          </div>
        </div>
        <AccountBalanceBadge customer={customer} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/58">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
          <Phone className="size-4 text-racing-red" /> {customer.phone}
        </span>
        {customer.email ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
            <Mail className="size-4 text-racing-red" /> {customer.email}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric icon={Bike} label="Motos" value={motorcycles.length} />
        <Metric icon={ShoppingBag} label="Compras" value={sales.length} />
        <Metric icon={Wrench} label="Taller" value={activeOrders.length} active />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {motorcycles.length === 0 ? (
          <Badge variant="outline">Solo repuestos</Badge>
        ) : (
          motorcycles.slice(0, 2).map((moto) => (
            <Badge key={moto.id} variant="outline">
              {moto.brandModel}
            </Badge>
          ))
        )}
        {motorcycles.length > 2 ? (
          <Badge variant="neutral">+{motorcycles.length - 2}</Badge>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
        <p className="text-xs text-white/42">
          Última visita: <span className="text-white/68">{customer.lastVisit ?? "—"}</span>
        </p>
        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onView(customer); }}>
          Ver ficha
        </Button>
      </div>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  active
}: {
  icon: typeof Bike;
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2.5">
      <Icon className={`mx-auto size-4 ${active && value > 0 ? "text-racing-red" : "text-white/38"}`} />
      <p className="mt-1 font-display text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/38">{label}</p>
    </div>
  );
}
