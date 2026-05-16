"use client";

import { CreditCard, PackageCheck, ReceiptText, TrendingUp } from "lucide-react";

import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentSales } from "@/data/mock-data";
import { money } from "@/lib/utils";

export function SalesModule() {
  const metrics = [
    { title: "Ticket promedio", value: 156000, trend: "+12%", label: "semana", icon: ReceiptText },
    { title: "Productos vendidos", value: 348, trend: "+41", label: "este mes", icon: PackageCheck },
    { title: "Clientes frecuentes", value: 64, trend: "Top 18%", label: "recompra", icon: TrendingUp },
    { title: "Pagos digitales", value: 73, trend: "+9%", label: "del total", icon: CreditCard }
  ];

  return (
    <ModuleShell
      eyebrow="Ventas & POS"
      title="Ventas rápidas con lectura comercial"
      description="Una vista tipo mostrador premium para entender tickets, clientes frecuentes, medios de pago y operaciones recientes."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            label={metric.label}
            icon={metric.icon}
            moneyValue={metric.value > 1000}
          />
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Ventas recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead className="border-y border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/42">
                <tr>
                  <th className="px-5 py-4">Venta</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Monto</th>
                  <th className="px-5 py-4">Pago</th>
                  <th className="px-5 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-white/[0.04]">
                    <td className="px-5 py-4">
                      <p className="font-display font-bold text-white">{sale.id}</p>
                      <p className="mt-1 text-xs text-white/44">{sale.items}</p>
                    </td>
                    <td className="px-5 py-4 text-white/74">{sale.customer}</td>
                    <td className="px-5 py-4 text-white/54">{sale.date}</td>
                    <td className="px-5 py-4 font-semibold text-white">{money(sale.amount)}</td>
                    <td className="px-5 py-4 text-white/64">{sale.method}</td>
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
    </ModuleShell>
  );
}
