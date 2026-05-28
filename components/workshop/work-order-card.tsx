"use client";

import { Bike, Calendar, UserRound, Wrench } from "lucide-react";
import { motion } from "framer-motion";

import { WorkOrderStatusBadge } from "@/components/workshop/work-order-status-badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCrm } from "@/contexts/crm-context";
import { getWorkOrderGrandTotal, getWorkOrderPartsTotal, getWorkOrderProgress } from "@/lib/crm";
import { cn, money } from "@/lib/utils";
import type { WorkOrder } from "@/types/crm";
import { WORK_ORDER_STATUSES } from "@/types/crm";

type WorkOrderCardProps = {
  order: WorkOrder;
  index?: number;
  onView: (order: WorkOrder) => void;
};

export function WorkOrderCard({ order, index = 0, onView }: WorkOrderCardProps) {
  const { getCustomerById, getMotorcycleById } = useCrm();
  const customer = getCustomerById(order.customerId);
  const motorcycle = order.motorcycleId ? getMotorcycleById(order.motorcycleId) : undefined;
  const progress = getWorkOrderProgress(order.status);
  const statusIndex = WORK_ORDER_STATUSES.indexOf(order.status);
  const partsTotal = getWorkOrderPartsTotal(order.parts);
  const grandTotal = getWorkOrderGrandTotal(partsTotal, order.laborCost ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className="h-full cursor-pointer p-5 transition-all hover:border-racing-red/45 hover:shadow-glow"
        onClick={() => onView(order)}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs font-bold text-racing-red">{order.id}</p>
            <h3 className="mt-2 font-display text-lg font-bold leading-tight text-white">
              {motorcycle?.brandModel ?? "Sin moto asignada"}
            </h3>
          </div>
          <WorkOrderStatusBadge status={order.status} />
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-6 text-white/62">{order.problem}</p>

        <div className="mt-4 grid gap-2 text-sm text-white/58">
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4 shrink-0 text-racing-red" />
            {customer?.name ?? "Cliente desconocido"}
          </span>
          {motorcycle ? (
            <span className="inline-flex items-center gap-2">
              <Bike className="size-4 shrink-0 text-racing-red" />
              {motorcycle.plate}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <Wrench className="size-4 shrink-0 text-racing-red" />
            {order.mechanic}
          </span>
          <span className="inline-flex items-center gap-2">
            <Calendar className="size-4 shrink-0 text-racing-red" />
            {order.createdAt}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {order.parts.length > 0 ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/58">
              {order.parts.length} repuesto{order.parts.length === 1 ? "" : "s"} · {money(partsTotal)}
            </span>
          ) : null}
          {(order.laborCost !== undefined && order.laborCost > 0) || grandTotal > partsTotal ? (
            <span className="rounded-full border border-racing-red/25 bg-racing-red/10 px-2.5 py-1 font-semibold text-red-100">
              Total {money(grandTotal)}
            </span>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-white/52">Avance</span>
            <span className="font-display font-bold text-white">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-0.5 overflow-x-auto pb-1">
          {WORK_ORDER_STATUSES.map((step, stepIndex) => {
            const active = stepIndex <= statusIndex;
            return (
              <div key={step} className="flex min-w-[52px] flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "size-2.5 shrink-0 rounded-full border",
                    active ? "border-racing-red bg-racing-red shadow-glow" : "border-white/16 bg-white/8"
                  )}
                />
                <span className="max-w-[56px] text-center text-[9px] font-semibold leading-tight text-white/42">
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
