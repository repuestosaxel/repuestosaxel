"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ClipboardCheck,
  HandCoins,
  PackageSearch,
  TrendingUp,
  Users
} from "lucide-react";

import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { money } from "@/lib/utils";
import type { DashboardMetrics } from "@/types/dashboard";

const chartColors = ["#ff0000", "#b30000", "#ffffff", "#6b7280", "#ef4444"];

const statIcons = [HandCoins, TrendingUp, PackageSearch, ClipboardCheck, Users, TrendingUp];

const tooltipStyle = {
  background: "#0b0b0b",
  border: "1px solid #2a2a2a",
  borderRadius: "10px",
  color: "#fff"
};

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const data = await api.get<DashboardMetrics>("/api/dashboard");
        if (active) setMetrics(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <ModuleShell
        eyebrow="Centro de comando"
        title="Performance del negocio en tiempo real"
        description="Cargando métricas desde la base de datos..."
      >
        <EmptyState
          title="Sincronizando datos"
          description="Obteniendo ventas, stock y taller..."
          action="Cargando"
        />
      </ModuleShell>
    );
  }

  if (error || !metrics) {
    return (
      <ModuleShell
        eyebrow="Centro de comando"
        title="Performance del negocio en tiempo real"
        description="No se pudieron cargar las métricas."
      >
        <EmptyState
          title="Error al cargar dashboard"
          description={error ?? "Verificá la conexión a la base de datos."}
          action="Reintentar"
        />
      </ModuleShell>
    );
  }

  const { stats, weeklySales, topProducts, monthlyIncome, categorySales, activities } = metrics;

  return (
    <ModuleShell
      eyebrow="Centro de comando"
      title="Performance del negocio en tiempo real"
      description="Una vista ejecutiva para controlar ventas, stock, taller y flujo financiero con foco en velocidad y decisión."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            label={stat.label}
            icon={statIcons[index] ?? HandCoins}
            moneyValue={stat.value > 1000}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Ventas semanales" description="Repuestos y taller comparados por día">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklySales}>
              <defs>
                <linearGradient id="salesRed" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#ff0000" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="workshopWhite" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#202020" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#8b8b8b" tickLine={false} axisLine={false} />
              <YAxis stroke="#8b8b8b" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
              <Area type="monotone" dataKey="ventas" stroke="#ff0000" strokeWidth={3} fill="url(#salesRed)" />
              <Area type="monotone" dataKey="taller" stroke="#ffffff" strokeWidth={2} fill="url(#workshopWhite)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Productos más vendidos" description="Ranking por unidades en el mes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid stroke="#202020" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="#8b8b8b" tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={108} stroke="#bdbdbd" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="ventas" radius={[0, 8, 8, 0]} fill="#ff0000" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartCard title="Ingresos mensuales" description="Evolución de ingresos contra egresos">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncome}>
              <CartesianGrid stroke="#202020" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#8b8b8b" tickLine={false} axisLine={false} />
              <YAxis stroke="#8b8b8b" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000000}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
              <Bar dataKey="ingresos" fill="#ff0000" radius={[8, 8, 0, 0]} />
              <Bar dataKey="egresos" fill="#404040" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Categorías calientes</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {categorySales.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/42">
                Sin ventas por categoría aún.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySales} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                    {categorySales.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/42">
              Sin actividad reciente registrada.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {activities.map((activity) => (
                <div key={`${activity.title}-${activity.time}`} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="font-display text-sm font-bold text-white">{activity.title}</p>
                  <p className="mt-2 text-sm leading-5 text-white/54">{activity.detail}</p>
                  <p className="mt-3 text-xs font-semibold text-racing-red">{activity.time}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
