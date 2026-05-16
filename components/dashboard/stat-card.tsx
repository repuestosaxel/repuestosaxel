"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { money } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  trend: string;
  label: string;
  icon: LucideIcon;
  moneyValue?: boolean;
};

export function StatCard({ title, value, trend, label, icon: Icon, moneyValue }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group p-5 transition-all hover:border-racing-red/45 hover:shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/52">{title}</p>
            <p className="mt-3 font-display text-2xl font-bold text-white md:text-3xl">
              {moneyValue ? money(value) : value}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl border border-racing-red/35 bg-racing-red/15 text-racing-red transition-transform group-hover:scale-105">
            <Icon className="size-5" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-sm">
          <span className="rounded-full bg-racing-red px-2 py-1 text-xs font-bold text-white">{trend}</span>
          <span className="text-white/46">{label}</span>
        </div>
      </Card>
    </motion.div>
  );
}
