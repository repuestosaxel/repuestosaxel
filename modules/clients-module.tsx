"use client";

import { Bike, Clock3, Phone } from "lucide-react";

import { ModuleShell } from "@/components/dashboard/module-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { customers } from "@/data/mock-data";
import { money } from "@/lib/utils";

export function ClientsModule() {
  return (
    <ModuleShell
      eyebrow="CRM de taller"
      title="Clientes, motos e historial"
      description="Perfiles pensados para atender más rápido: moto, patente, deuda, última visita y trabajos realizados."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {customers.map((customer) => (
          <Card key={customer.phone} className="p-5 transition-all hover:border-racing-red/45 hover:shadow-glow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-white">{customer.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/58">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
                    <Phone className="size-4 text-racing-red" /> {customer.phone}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
                    <Bike className="size-4 text-racing-red" /> {customer.bike}
                  </span>
                </div>
              </div>
              <Badge variant={customer.debt > 0 ? "warning" : "success"}>
                {customer.debt > 0 ? `Debe ${money(customer.debt)}` : "Sin deuda"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                <p className="text-xs text-white/42">Patente</p>
                <p className="mt-1 font-display font-bold">{customer.plate}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3 sm:col-span-2">
                <p className="flex items-center gap-2 text-xs text-white/42">
                  <Clock3 className="size-3.5 text-racing-red" /> Última visita
                </p>
                <p className="mt-1 font-display font-bold">{customer.lastVisit}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Últimos trabajos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {customer.history.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-white/64">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ModuleShell>
  );
}
