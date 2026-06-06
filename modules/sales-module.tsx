"use client";

import { useMemo, useState } from "react";
import { CreditCard, PackageCheck, Plus, ReceiptText, TrendingUp } from "lucide-react";

import { ContextBanner } from "@/components/dashboard/context-banner";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { SearchField } from "@/components/dashboard/search-field";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { NewSaleDialog } from "@/components/sales/new-sale-dialog";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/contexts/sales-context";
import { useEffectiveSearch } from "@/hooks/use-effective-search";
import { useFinanceMetrics } from "@/hooks/use-finance-metrics";
import { getSaleItemsSummary } from "@/lib/sales";
import { cn, money } from "@/lib/utils";
import type { PaymentMethod, Sale, SaleStatus } from "@/types/sales";
import { PAYMENT_METHODS, SALE_STATUSES } from "@/types/sales";

export function SalesModule() {
  const { sales, loading, error, refresh, getSaleById } = useSales();
  const metrics = useFinanceMetrics();
  const [search, setSearch] = useState("");
  const { effectiveQuery, searchFieldValue, onSearchFieldChange } = useEffectiveSearch(
    search,
    setSearch
  );
  const [statusFilter, setStatusFilter] = useState<SaleStatus | "todos">("todos");
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "todos">("todos");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        !effectiveQuery ||
        sale.reference.toLowerCase().includes(effectiveQuery) ||
        sale.customerName?.toLowerCase().includes(effectiveQuery) ||
        sale.id.toLowerCase().includes(effectiveQuery) ||
        getSaleItemsSummary(sale.items).toLowerCase().includes(effectiveQuery) ||
        sale.paymentMethod.toLowerCase().includes(effectiveQuery) ||
        sale.status.toLowerCase().includes(effectiveQuery);

      const matchesStatus = statusFilter === "todos" || sale.status === statusFilter;
      const matchesPayment = paymentFilter === "todos" || sale.paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [sales, effectiveQuery, statusFilter, paymentFilter]);

  const statCards = [
    {
      title: "Ventas del día",
      value: metrics.todaySales,
      trend: `${filteredSales.length} operaciones`,
      label: "registradas",
      icon: ReceiptText,
      moneyValue: true
    },
    {
      title: "Ticket promedio",
      value: metrics.averageTicket,
      trend: `${metrics.soldUnits} u.`,
      label: "vendidas",
      icon: TrendingUp,
      moneyValue: true
    },
    {
      title: "Ingresos por ventas",
      value: metrics.productSalesIncome,
      trend: "Productos",
      label: "mostrador",
      icon: PackageCheck,
      moneyValue: true
    },
    {
      title: "Pagos digitales",
      value:
        metrics.paymentMethods.find((item) => item.method === "Mercado Pago")?.percentage ?? 0,
      trend: "Mercado Pago",
      label: "del total",
      icon: CreditCard,
      moneyValue: false
    }
  ];

  const openDetail = (sale: Sale) => {
    setSelectedSaleId(sale.id);
    setDetailOpen(true);
  };

  const selectedSale = selectedSaleId ? getSaleById(selectedSaleId) ?? null : null;

  return (
    <ModuleShell
      eyebrow="Ventas & POS"
      title="Ventas integradas con inventario"
      description="Flujo completo de mostrador con productos reales, descuento automático de stock, trazabilidad y métodos de pago."
      action={
        <NewSaleDialog
          trigger={
            <Button>
              <Plus /> Nueva venta
            </Button>
          }
        />
      }
    >
      <ContextBanner loading={loading} error={error} onRetry={refresh} label="ventas" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </div>

      <Card className="space-y-3 p-4 sm:p-5">
        <SearchField
          className="w-full max-w-xl"
          value={searchFieldValue}
          onChange={onSearchFieldChange}
          placeholder="Buscar por referencia, cliente, producto o pago..."
        />
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={statusFilter === "todos"}
            label="Estado: Todos"
            onClick={() => setStatusFilter("todos")}
          />
          {SALE_STATUSES.map((status) => (
            <FilterPill
              key={status}
              active={statusFilter === status}
              label={status}
              onClick={() => setStatusFilter(status)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={paymentFilter === "todos"}
            label="Pago: Todos"
            onClick={() => setPaymentFilter("todos")}
          />
          {PAYMENT_METHODS.map((method) => (
            <FilterPill
              key={method}
              active={paymentFilter === method}
              label={method}
              onClick={() => setPaymentFilter(method)}
            />
          ))}
        </div>
        <p className="text-xs text-white/40">
          <span className="font-bold text-white">{filteredSales.length}</span> de {sales.length}{" "}
          ventas
        </p>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Ventas recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-y border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/42">
                <tr>
                  <th className="px-5 py-4">Venta</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Productos</th>
                  <th className="px-5 py-4">Monto</th>
                  <th className="px-5 py-4">Pago</th>
                  <th className="px-5 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-white/48">
                      No hay ventas que coincidan con los filtros.
                    </td>
                  </tr>
                ) : null}
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-white/[0.04]",
                      sale.status === "Cancelado" && "opacity-60"
                    )}
                    onClick={() => openDetail(sale)}
                  >
                    <td className="px-5 py-4">
                      <p className="font-display font-bold text-white">{sale.reference}</p>
                      <p className="mt-1 text-xs text-white/44">{sale.id}</p>
                    </td>
                    <td className="px-5 py-4 text-white/74">
                      {sale.customerName ?? "Mostrador"}
                    </td>
                    <td className="px-5 py-4 text-white/54">{sale.createdAt}</td>
                    <td className="px-5 py-4 text-white/58">
                      {sale.items.length} ítem{sale.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">{money(sale.total)}</td>
                    <td className="px-5 py-4 text-white/64">{sale.paymentMethod}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={sale.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SaleDetailDialog sale={selectedSale} open={detailOpen} onOpenChange={setDetailOpen} />
    </ModuleShell>
  );
}

function FilterPill({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        active
          ? "border-racing-red bg-racing-red/20 text-white shadow-glow"
          : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white"
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
