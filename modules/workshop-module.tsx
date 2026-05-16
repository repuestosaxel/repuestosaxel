"use client";

import { Bike, Calendar, UserRound } from "lucide-react";
import { motion } from "framer-motion";

import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { repairs } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export function WorkshopModule() {
  return (
    <ModuleShell
      eyebrow="Taller racing"
      title="Motos en reparación"
      description="Seguimiento visual de estados, mecánicos asignados y avance de cada moto desde recepción hasta entrega."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {repairs.map((repair, index) => (
          <motion.div
            key={repair.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full p-5 transition-all hover:border-racing-red/45 hover:shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xs font-bold text-racing-red">{repair.id}</p>
                  <h3 className="mt-2 font-display text-xl font-bold text-white">{repair.bike}</h3>
                </div>
                <StatusBadge status={repair.status} />
              </div>

              <p className="mt-4 min-h-12 text-sm leading-6 text-white/62">{repair.problem}</p>

              <div className="mt-5 grid gap-2 text-sm text-white/58">
                <span className="inline-flex items-center gap-2">
                  <UserRound className="size-4 text-racing-red" /> {repair.customer}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Bike className="size-4 text-racing-red" /> Mecánico: {repair.mechanic}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="size-4 text-racing-red" /> Ingreso: {repair.date}
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/52">Avance</span>
                  <span className="font-display font-bold text-white">{repair.progress}%</span>
                </div>
                <Progress value={repair.progress} />
              </div>

              <div className="mt-6 flex items-center justify-between gap-1">
                {repair.steps.map((step, stepIndex) => {
                  const active = repair.progress >= (stepIndex / (repair.steps.length - 1)) * 100;
                  return (
                    <div key={step} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={cn(
                          "size-3 rounded-full border",
                          active ? "border-racing-red bg-racing-red shadow-glow" : "border-white/16 bg-white/8"
                        )}
                      />
                      <span className="max-w-[70px] text-center text-[10px] font-semibold text-white/42">{step}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </ModuleShell>
  );
}
