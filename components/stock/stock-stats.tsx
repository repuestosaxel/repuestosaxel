"use client";

import { useInventory } from "@/contexts/inventory-context";
import { getStockStatus } from "@/lib/inventory";
import { money } from "@/lib/utils";

import { StatCard } from "@/components/dashboard/stat-card";
import { AlertTriangle, Boxes, CircleDollarSign, TrendingUp } from "lucide-react";

export function StockStats() {
  const { products } = useInventory();

  const lowStock = products.filter((p) => getStockStatus(p.stock, p.min) === "Bajo stock").length;
  const outOfStock = products.filter((p) => getStockStatus(p.stock, p.min) === "Sin stock").length;
  const inventoryValue = products.reduce((sum, p) => sum + p.publicPrice * p.stock, 0);
  const avgMargin =
    products.length === 0
      ? 0
      : Math.round(
          products.reduce((sum, p) => {
            if (p.purchasePrice <= 0) return sum;
            return sum + ((p.publicPrice - p.purchasePrice) / p.purchasePrice) * 100;
          }, 0) / products.length
        );

  const stats = [
    {
      title: "Productos activos",
      value: products.length,
      trend: `${outOfStock} sin stock`,
      label: "en catálogo",
      icon: Boxes,
      moneyValue: false
    },
    {
      title: "Alertas de stock",
      value: lowStock + outOfStock,
      trend: `${lowStock} bajo mínimo`,
      label: "requieren acción",
      icon: AlertTriangle,
      moneyValue: false
    },
    {
      title: "Valor inventario",
      value: inventoryValue,
      trend: "precio público",
      label: "stock actual",
      icon: CircleDollarSign,
      moneyValue: true
    },
    {
      title: "Margen promedio",
      value: avgMargin,
      trend: `+${avgMargin}%`,
      label: "rentabilidad",
      icon: TrendingUp,
      moneyValue: false
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
