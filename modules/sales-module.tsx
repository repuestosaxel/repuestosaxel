"use client";

import { useMemo, useState } from "react";
import { CreditCard, PackageCheck, Plus, ReceiptText, Search, TrendingUp } from "lucide-react";

import { ContextBanner } from "@/components/dashboard/context-banner";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { NewSaleDialog } from "@/components/sales/new-sale-dialog";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSales } from "@/contexts/sales-context";
import { useFinanceMetrics } from "@/hooks/use-finance-metrics";
import { getSaleItemsSummary } from "@/lib/sales";
import { cn, money } from "@/lib/utils";
import type { Sale } from "@/types/sales";

export function SalesModule() {
  const { sales, loading, error, refresh, getSaleById } = useSales();
  const metrics = useFinanceMetrics();
  const [search, setSearch] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sales;

    return sales.filter(
      (sale) =>
        sale.reference.toLowerCase().includes(query) ||
        sale.customerName?.toLowerCase().includes(query) ||
        getSaleItemsSummary(sale.items).toLowerCase().includes(query) ||
        sale.paymentMethod.toLowerCase().includes(query)
    );
  }, [sales, search]);

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

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
          <Input
            className="pl-10"
            placeholder="Buscar por referencia, cliente, producto o pago..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
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
