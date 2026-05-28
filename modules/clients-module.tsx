"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, LayoutList, Plus, Search, Users } from "lucide-react";

import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { ClientCard } from "@/components/clients/client-card";
import { ClientDetailDialog } from "@/components/clients/client-detail-dialog";
import { AccountBalanceBadge } from "@/components/clients/account-balance-badge";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCrm } from "@/contexts/crm-context";
import { getAccountBalanceState } from "@/lib/crm";
import { cn } from "@/lib/utils";
import type { ClientFilter, Customer } from "@/types/crm";

type ViewMode = "grid" | "list";

const filters: { id: ClientFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "con_motos", label: "Con motos" },
  { id: "solo_repuestos", label: "Solo repuestos" },
  { id: "cuenta_corriente", label: "Cuenta corriente" }
];

export function ClientsModule() {
  const { customers, motorcycles, getMotorcyclesByCustomer } = useCrm();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ClientFilter>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const motos = getMotorcyclesByCustomer(customer.id);
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query);

      const matchesFilter =
        filter === "todos" ||
        (filter === "con_motos" && motos.length > 0) ||
        (filter === "solo_repuestos" && motos.length === 0) ||
        (filter === "cuenta_corriente" && customer.accountEnabled);

      return matchesSearch && matchesFilter;
    });
  }, [customers, search, filter, getMotorcyclesByCustomer]);

  const stats = useMemo(() => {
    const withAccount = customers.filter((c) => c.accountEnabled).length;
    const withDebt = customers.filter((c) => getAccountBalanceState(c.balance) === "debt").length;
    const partsOnly = customers.filter(
      (c) => getMotorcyclesByCustomer(c.id).length === 0
    ).length;

    return [
      {
        title: "Clientes activos",
        value: customers.length,
        trend: `${motorcycles.length} motos`,
        label: "registradas",
        icon: Users,
        moneyValue: false
      },
      {
        title: "Cuenta corriente",
        value: withAccount,
        trend: `${withDebt} con deuda`,
        label: "habilitadas",
        icon: Users,
        moneyValue: false
      },
      {
        title: "Solo repuestos",
        value: partsOnly,
        trend: "Sin moto",
        label: "mostrador",
        icon: Users,
        moneyValue: false
      }
    ];
  }, [customers, motorcycles.length, getMotorcyclesByCustomer]);

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  };

  const liveSelected =
    selectedCustomer ? customers.find((c) => c.id === selectedCustomer.id) ?? selectedCustomer : null;

  return (
    <ModuleShell
      eyebrow="CRM de taller"
      title="Clientes"
      description="Fichas completas con cuenta corriente, motos opcionales e historial de compras y taller."
      action={
        <AddClientDialog
          trigger={
            <Button>
              <Plus /> Nuevo cliente
            </Button>
          }
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
            <Input
              className="pl-10"
              placeholder="Buscar por nombre, teléfono o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={viewMode === "grid" ? "default" : "secondary"}
              onClick={() => setViewMode("grid")}
              aria-label="Vista grilla"
            >
              <LayoutGrid />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "list" ? "default" : "secondary"}
              onClick={() => setViewMode("list")}
              aria-label="Vista lista"
            >
              <LayoutList />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                filter === item.id
                  ? "border-racing-red bg-racing-red/20 text-white shadow-glow"
                  : "border-white/10 bg-white/[0.04] text-white/52 hover:border-white/20 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {filteredCustomers.length === 0 ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <p className="font-display text-xl font-bold text-white">Sin resultados</p>
          <p className="mt-2 text-sm text-white/48">Ajustá filtros o creá un cliente nuevo.</p>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <ClientCard key={customer.id} customer={customer} onView={openDetail} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/42">
                <tr>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Contacto</th>
                  <th className="px-5 py-4">Motos</th>
                  <th className="px-5 py-4">Cuenta</th>
                  <th className="px-5 py-4">Última visita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredCustomers.map((customer) => {
                  const motos = getMotorcyclesByCustomer(customer.id);
                  return (
                    <tr
                      key={customer.id}
                      className="cursor-pointer transition-colors hover:bg-racing-red/[0.045]"
                      onClick={() => openDetail(customer)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{customer.name}</p>
                        <p className="text-xs text-white/38">{customer.id}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/64">
                        <p>{customer.phone}</p>
                        {customer.email ? <p className="text-xs text-white/42">{customer.email}</p> : null}
                      </td>
                      <td className="px-5 py-4 text-sm text-white/64">
                        {motos.length === 0 ? "Solo repuestos" : `${motos.length} moto(s)`}
                      </td>
                      <td className="px-5 py-4">
                        <AccountBalanceBadge customer={customer} />
                      </td>
                      <td className="px-5 py-4 text-sm text-white/54">{customer.lastVisit ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ClientDetailDialog
        customer={liveSelected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </ModuleShell>
  );
}
