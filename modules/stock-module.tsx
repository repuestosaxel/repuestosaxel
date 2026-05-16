"use client";

import { Filter, Plus, Search } from "lucide-react";

import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { products } from "@/data/mock-data";
import { money } from "@/lib/utils";

export function StockModule() {
  return (
    <ModuleShell
      eyebrow="Inventario inteligente"
      title="Stock de repuestos y accesorios"
      description="Control visual de disponibilidad, precios y productos críticos para evitar quiebres en mostrador y taller."
      action={
        <Button>
          <Plus /> Agregar producto
        </Button>
      }
    >
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
            <Input className="pl-10" placeholder="Buscar por nombre, categoría o código..." />
          </div>
          <Button variant="secondary">
            <Filter /> Filtros
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-white/42">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-racing-red/[0.045]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`carbon flex size-14 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${product.accent}`}>
                        <span className="font-display text-xs font-bold">{product.id.split("-")[1]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-white/42">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/64">{product.category}</td>
                  <td className="px-5 py-4">
                    <span className="font-display text-lg font-bold text-white">{product.stock}</span>
                    <span className="ml-2 text-xs text-white/38">mín. {product.min}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">{money(product.price)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ModuleShell>
  );
}
