"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Plus, Search, Wrench } from "lucide-react";

import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { AddWorkOrderDialog } from "@/components/workshop/add-work-order-dialog";
import { WorkOrderCard } from "@/components/workshop/work-order-card";
import { WorkOrderDetailDialog } from "@/components/workshop/work-order-detail-dialog";
import { WorkOrderStatusBadge } from "@/components/workshop/work-order-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCrm } from "@/contexts/crm-context";
import { isWorkOrderActive } from "@/lib/crm";
import { cn } from "@/lib/utils";
import type { WorkOrder, WorkOrderStatus } from "@/types/crm";
import { WORK_ORDER_STATUSES } from "@/types/crm";

type StatusFilter = WorkOrderStatus | "todos" | "activas";

export function WorkshopModule() {
  const { workOrders, getWorkOrderById, getCustomerById } = useCrm();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("activas");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workOrders.filter((order) => {
      const customer = getCustomerById(order.customerId);
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.problem.toLowerCase().includes(query) ||
        order.mechanic.toLowerCase().includes(query) ||
        customer?.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activas" && isWorkOrderActive(order.status)) ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workOrders, search, statusFilter, getCustomerById]);

  const stats = useMemo(() => {
    const active = workOrders.filter((o) => isWorkOrderActive(o.status)).length;
    const waitingParts = workOrders.filter((o) => o.status === "Esperando repuestos").length;
    const finished = workOrders.filter(
      (o) => o.status === "Finalizado" || o.status === "Entregado"
    ).length;

    return [
      {
        title: "Órdenes activas",
        value: active,
        trend: `${waitingParts} esperando repuestos`,
        label: "en pipeline",
        icon: Wrench,
        moneyValue: false
      },
      {
        title: "En diagnóstico",
        value: workOrders.filter((o) => o.status === "Diagnóstico").length,
        trend: "Evaluación inicial",
        label: "taller",
        icon: ClipboardCheck,
        moneyValue: false
      },
      {
        title: "Finalizadas / entregadas",
        value: finished,
        trend: "Histórico reciente",
        label: "completadas",
        icon: ClipboardCheck,
        moneyValue: false
      }
    ];
  }, [workOrders]);

  const openDetail = (order: WorkOrder) => {
    setSelectedOrderId(order.id);
    setDetailOpen(true);
  };

  const selectedOrder = selectedOrderId ? getWorkOrderById(selectedOrderId) ?? null : null;

  const statusFilters: { id: StatusFilter; label: string }[] = [
    { id: "activas", label: "Activas" },
    { id: "todos", label: "Todas" },
    ...WORK_ORDER_STATUSES.map((status) => ({ id: status as StatusFilter, label: status }))
  ];

  return (
    <ModuleShell
      eyebrow="Taller racing"
      title="Órdenes de trabajo"
      description="Pipeline completo desde ingreso hasta entrega. Asignación de cliente, moto, mecánico y estados visuales."
      action={
        <AddWorkOrderDialog
          trigger={
            <Button>
              <Plus /> Nueva orden
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
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
          <Input
            className="pl-10"
            placeholder="Buscar por orden, cliente, problema o mecánico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:py-2 sm:text-sm",
                statusFilter === item.id
                  ? "border-racing-red bg-racing-red/20 text-white shadow-glow"
                  : "border-white/10 bg-white/[0.04] text-white/52 hover:border-white/20 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <p className="font-display text-xl font-bold text-white">Sin órdenes</p>
          <p className="mt-2 text-sm text-white/48">
            No hay órdenes que coincidan con los filtros seleccionados.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order, index) => (
            <WorkOrderCard key={order.id} order={order} index={index} onView={openDetail} />
          ))}
        </div>
      )}

      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
          Resumen por estado
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {WORK_ORDER_STATUSES.map((status) => {
            const count = workOrders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors hover:border-racing-red/30"
              >
                <WorkOrderStatusBadge status={status} />
                <span className="font-display text-sm font-bold text-white">{count}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <WorkOrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </ModuleShell>
  );
}
