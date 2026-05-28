"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Search, Truck, UserRound } from "lucide-react";

import { AddSupplierDialog } from "@/components/stock/add-supplier-dialog";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/contexts/inventory-context";

export function SuppliersModule() {
  const { suppliers, products } = useInventory();
  const [search, setSearch] = useState("");

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return suppliers;

    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.id.toLowerCase().includes(query) ||
        supplier.contact?.toLowerCase().includes(query) ||
        supplier.phone?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query)
    );
  }, [suppliers, search]);

  const productCountBySupplier = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.supplierId, (counts.get(product.supplierId) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const stats = [
    {
      title: "Proveedores activos",
      value: suppliers.length,
      trend: "Tabla independiente",
      label: "supplierId en productos",
      icon: Truck,
      moneyValue: false
    },
    {
      title: "Productos vinculados",
      value: products.length,
      trend: `${suppliers.length} proveedores`,
      label: "en catálogo",
      icon: Truck,
      moneyValue: false
    }
  ];

  return (
    <ModuleShell
      eyebrow="Compras"
      title="Proveedores"
      description="Directorio de proveedores como entidad independiente. Cada producto referencia un proveedor para rastrear compras, ingresos y costos."
      action={<AddSupplierDialog />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
          <Input
            className="pl-10"
            placeholder="Buscar por nombre, contacto o email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Card>

      {filteredSuppliers.length === 0 ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <p className="font-display text-xl font-bold text-white">Sin resultados</p>
          <p className="mt-2 text-sm text-white/48">
            No hay proveedores que coincidan con la búsqueda.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSuppliers.map((supplier) => {
            const linkedProducts = productCountBySupplier.get(supplier.id) ?? 0;

            return (
              <Card
                key={supplier.id}
                className="p-5 transition-all hover:border-racing-red/45 hover:shadow-glow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-racing-red">
                      {supplier.id}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-white">
                      {supplier.name}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/58">
                    {linkedProducts} prod.
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-white/58">
                  {supplier.contact ? (
                    <p className="inline-flex items-center gap-2">
                      <UserRound className="size-4 text-racing-red" />
                      {supplier.contact}
                    </p>
                  ) : null}
                  {supplier.phone ? (
                    <p className="inline-flex items-center gap-2">
                      <Phone className="size-4 text-racing-red" />
                      {supplier.phone}
                    </p>
                  ) : null}
                  {supplier.email ? (
                    <p className="inline-flex items-center gap-2 break-all">
                      <Mail className="size-4 shrink-0 text-racing-red" />
                      {supplier.email}
                    </p>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ModuleShell>
  );
}
