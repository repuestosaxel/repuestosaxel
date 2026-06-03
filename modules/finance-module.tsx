"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  AlertTriangle,
  CircleDollarSign,
  HandCoins,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wrench
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceMetrics } from "@/hooks/use-finance-metrics";
import { cn, money, numberCompact } from "@/lib/utils";

const tooltipStyle = {
  background: "#0b0b0b",
  border: "1px solid #2a2a2a",
  borderRadius: "10px",
  color: "#fff"
};

const chartColors = ["#ff0000", "#ffffff", "#6b7280", "#ef4444", "#b30000"];

const PAYMENT_ICONS: Record<string, typeof CircleDollarSign> = {
  Efectivo: CircleDollarSign,
  Transferencia: HandCoins,
  "Mercado Pago": ReceiptText,
  Débito: ReceiptText,
  "Cuenta corriente": HandCoins
};

export function FinanceModule() {
  const metrics = useFinanceMetrics();

  const statCards = [
    {
      title: "Ingresos totales",
      value: metrics.totalIncome,
      trend: `${money(metrics.productSalesIncome)} ventas`,
      label: "mostrador",
      icon: CircleDollarSign,
      moneyValue: true
    },
    {
      title: "Egresos totales",
      value: metrics.totalExpenses,
      trend: `${money(metrics.operationalExpenses)} operativos`,
      label: "del total",
      icon: ReceiptText,
      moneyValue: true
    },
    {
      title: "Ganancia neta",
      value: metrics.netProfit,
      trend: `${metrics.profitMargin}%`,
      label: "rentabilidad",
      icon: metrics.netProfit >= 0 ? TrendingUp : TrendingDown,
      moneyValue: true
    },
    {
      title: "Ingresos taller",
      value: metrics.workshopIncome,
      trend: "Finalizado / Entregado",
      label: "servicios",
      icon: Wrench,
      moneyValue: true
    }
  ];

  const weeklyChartData = metrics.weeklyPeriod.map((point) => ({
    label: point.label,
    Ventas: point.productSales,
    Taller: point.workshop
  }));

  const incomeBreakdown = [
    { name: "Ventas productos", value: metrics.productSalesIncome },
    { name: "Servicios taller", value: metrics.workshopIncome }
  ].filter((item) => item.value > 0);

  const expenseBreakdown = [
    { name: "Compras proveedor", value: metrics.supplierPurchases },
    { name: "Gastos operativos", value: metrics.operationalExpenses }
  ].filter((item) => item.value > 0);

  return (
    <ModuleShell
      eyebrow="Control financiero"
      title="Dashboard financiero en tiempo real"
      description="Ingresos, egresos, rentabilidad, ventas por período, taller, productos top, métodos de pago y alertas operativas."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Ingresos vs egresos" description="Comparativa mensual del negocio">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.monthlyComparison}>
              <CartesianGrid stroke="#202020" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#8b8b8b" tickLine={false} axisLine={false} />
              <YAxis
                stroke="#8b8b8b"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${numberCompact(Number(value))}`}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => money(Number(value))} />
              <Legend />
              <Bar dataKey="ingresos" name="Ingresos" fill="#ff0000" radius={[8, 8, 0, 0]} />
              <Bar dataKey="egresos" name="Egresos" fill="#5f5f5f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ventas y taller por semana" description="Ingresos diarios por canal">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData}>
              <CartesianGrid stroke="#202020" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#8b8b8b" tickLine={false} axisLine={false} />
              <YAxis
                stroke="#8b8b8b"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${numberCompact(Number(value))}`}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => money(Number(value))} />
              <Legend />
              <Bar dataKey="Ventas" stackId="a" fill="#ff0000" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Taller" stackId="a" fill="#ffffff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Composición de ingresos</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {incomeBreakdown.length === 0 ? (
              <EmptyChartMessage message="Sin ingresos registrados todavía." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {incomeBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => money(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.paymentMethods.length === 0 ? (
              <EmptyChartMessage message="Sin ventas pagadas registradas." />
            ) : (
              metrics.paymentMethods.map((item) => {
                const Icon = PAYMENT_ICONS[item.method] ?? ReceiptText;
                return (
                  <div key={item.method} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/72">
                        <Icon className="size-4 text-racing-red" />
                        {item.method}
                      </span>
                      <span className="font-display text-lg font-bold">{item.percentage}%</span>
                    </div>
                    <p className="mt-1 text-xs text-white/42">
                      {item.count} venta{item.count === 1 ? "" : "s"} · {money(item.amount)}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-racing-red"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topProducts.length === 0 ? (
              <EmptyChartMessage message="Todavía no hay productos vendidos." />
            ) : (
              metrics.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/38">
                        #{index + 1}
                      </p>
                      <p className="mt-1 font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-white/42">{product.quantity} unidades</p>
                    </div>
                    <p className="font-display font-bold text-racing-red">{money(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Estructura de egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseBreakdown.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span className="text-sm text-white/62">{item.name}</span>
                  <span className="font-display font-bold text-white">{money(item.value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl border border-racing-red/25 bg-racing-red/10 px-4 py-3">
                <span className="text-sm font-semibold text-white/72">Ganancia neta estimada</span>
                <span className="font-display text-lg font-bold text-white">
                  {money(metrics.netProfit)}
                </span>
              </div>
              <p className="text-xs text-white/40">
                Rentabilidad: {metrics.profitMargin}% sobre ingresos totales (
                {money(metrics.totalIncome)}).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas operativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.alerts.length === 0 ? (
              <EmptyChartMessage message="Sin alertas relevantes por ahora." />
            ) : (
              metrics.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    alert.severity === "danger" && "border-red-500/30 bg-red-500/10",
                    alert.severity === "warning" && "border-amber-500/30 bg-amber-500/10",
                    alert.severity === "info" && "border-white/10 bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        alert.severity === "danger" && "text-red-300",
                        alert.severity === "warning" && "text-amber-200",
                        alert.severity === "info" && "text-white/50"
                      )}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">{alert.title}</p>
                        <Badge variant="outline">{alert.type.replace("_", " ")}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-white/58">{alert.detail}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  );
}

function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="grid h-full min-h-[180px] place-items-center rounded-2xl border border-dashed border-white/10 px-4 text-center text-sm text-white/42">
      {message}
    </div>
  );
}
