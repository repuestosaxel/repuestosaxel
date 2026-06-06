"use client";

import { useMemo, useState } from "react";
import { Mail, Pencil, Phone, Trash2, Truck, UserRound } from "lucide-react";

import { AddSupplierDialog } from "@/components/stock/add-supplier-dialog";
import { EditSupplierDialog } from "@/components/stock/edit-supplier-dialog";
import { CatalogModuleSkeleton, ModuleDataGate } from "@/components/dashboard/data-loading";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { SearchField } from "@/components/dashboard/search-field";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInventory } from "@/contexts/inventory-context";
import { useEffectiveSearch } from "@/hooks/use-effective-search";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types/inventory";

export function SuppliersModule() {
  const { suppliers, products, loading, error, refresh, deleteSupplier } = useInventory();
  const [search, setSearch] = useState("");
  const { effectiveQuery, searchFieldValue, onSearchFieldChange } = useEffectiveSearch(
    search,
    setSearch
  );
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredSuppliers = useMemo(() => {
    const query = effectiveQuery;
    if (!query) return suppliers;

    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.id.toLowerCase().includes(query) ||
        supplier.contact?.toLowerCase().includes(query) ||
        supplier.phone?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query)
    );
  }, [suppliers, effectiveQuery]);

  const productCountBySupplier = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.supplierId, (counts.get(product.supplierId) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const handleDelete = async (supplier: Supplier) => {
    setDeleting(true);
    setActionError(null);
    try {
      await deleteSupplier(supplier.id);
      setConfirmDeleteId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar el proveedor.");
    } finally {
      setDeleting(false);
    }
  };

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
      <ModuleDataGate
        loading={loading}
        error={error}
        onRetry={refresh}
        skeleton={
          <CatalogModuleSkeleton
            statCount={2}
            statColumns="sm:grid-cols-2"
            gridItems={6}
          />
        }
      >
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {actionError ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {actionError}
        </p>
      ) : null}

      <Card className="p-4 sm:p-5">
        <SearchField
          className="w-full max-w-xl"
          value={searchFieldValue}
          onChange={onSearchFieldChange}
          placeholder="Buscar por nombre, contacto o email..."
        />
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
            const isConfirmingDelete = confirmDeleteId === supplier.id;

            return (
              <Card
                key={supplier.id}
                className={cn(
                  "p-5 transition-all hover:border-racing-red/45 hover:shadow-glow",
                  isConfirmingDelete && "border-red-500/30 bg-red-500/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-racing-red">
                      {supplier.id}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-white">{supplier.name}</h2>
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

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                  {isConfirmingDelete ? (
                    <>
                      <span className="w-full text-xs text-red-100">¿Eliminar proveedor?</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={deleting}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        disabled={deleting}
                        onClick={() => void handleDelete(supplier)}
                      >
                        {deleting ? "..." : "Confirmar"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setActionError(null);
                          setEditingSupplier(supplier);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="border-red-500/20 text-red-200 hover:border-red-500/35 hover:bg-red-500/10"
                        onClick={() => {
                          setActionError(null);
                          setConfirmDeleteId(supplier.id);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <EditSupplierDialog
        supplier={editingSupplier}
        open={Boolean(editingSupplier)}
        onOpenChange={(open) => {
          if (!open) setEditingSupplier(null);
        }}
      />
      </ModuleDataGate>
    </ModuleShell>
  );
}
