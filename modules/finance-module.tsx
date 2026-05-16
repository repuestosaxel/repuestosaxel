"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { ChartCard } from "@/components/dashboard/chart-card";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monthlyIncome, paymentMethods } from "@/data/mock-data";
import { money } from "@/lib/utils";
import { CircleDollarSign, HandCoins, ReceiptText, TrendingUp } from "lucide-react";

const tooltipStyle = {
  background: "#0b0b0b",
  border: "1px solid #2a2a2a",
  borderRadius: "10px",
  color: "#fff"
};

export function FinanceModule() {
  const metrics = [
    { title: "Ingresos", value: 18450000, trend: "+24.1%", label: "mensual", icon: CircleDollarSign },
    { title: "Egresos", value: 10300000, trend: "-3.2%", label: "optimizado", icon: ReceiptText },
    { title: "Ganancias", value: 8150000, trend: "+18.8%", label: "bruto", icon: TrendingUp },
    { title: "Gastos taller", value: 2140000, trend: "21%", label: "del egreso", icon: HandCoins }
  ];

  return (
    <ModuleShell
      eyebrow="Control financiero"
      title="Ingresos, egresos y rentabilidad"
      description="Resumen premium para entender caja, facturación, métodos de pago y evolución mensual del negocio."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} moneyValue />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <ChartCard title="Comparativa mensual" description="Facturación y egresos operativos">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncome}>
              <CartesianGrid stroke="#202020" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#8b8b8b" tickLine={false} axisLine={false} />
              <YAxis stroke="#8b8b8b" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000000}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
              <Bar dataKey="ingresos" fill="#ff0000" radius={[8, 8, 0, 0]} />
              <Bar dataKey="egresos" fill="#5f5f5f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.method} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/72">
                      <Icon className="size-4 text-racing-red" /> {item.method}
                    </span>
                    <span className="font-display text-lg font-bold">{item.value}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-racing-red" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  );
}
