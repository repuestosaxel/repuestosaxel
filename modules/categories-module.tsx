"use client";

import { useMemo, useState } from "react";
import { Layers2, Search } from "lucide-react";

import { AddCategoryDialog } from "@/components/stock/add-category-dialog";
import { AddSubcategoryDialog } from "@/components/stock/add-subcategory-dialog";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/contexts/inventory-context";

export function CategoriesModule() {
  const { categories, subcategories, getSubcategoriesByCategory } = useInventory();
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => {
      const subs = getSubcategoriesByCategory(category.id);
      return (
        category.name.toLowerCase().includes(query) ||
        category.id.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        subs.some(
          (sub) =>
            sub.name.toLowerCase().includes(query) ||
            sub.id.toLowerCase().includes(query) ||
            sub.description?.toLowerCase().includes(query)
        )
      );
    });
  }, [categories, search, getSubcategoriesByCategory]);

  const stats = [
    {
      title: "Categorías",
      value: categories.length,
      trend: "Entidades raíz",
      label: "tabla independiente",
      icon: Layers2,
      moneyValue: false
    },
    {
      title: "Subcategorías",
      value: subcategories.length,
      trend: "Vinculadas por categoryId",
      label: "tabla independiente",
      icon: Layers2,
      moneyValue: false
    }
  ];

  return (
    <ModuleShell
      eyebrow="Catálogo"
      title="Categorías y subcategorías"
      description="Gestión unificada del árbol de clasificación. Categorías y subcategorías son tablas independientes relacionadas entre sí y con los productos."
      action={
        <div className="flex flex-wrap gap-2">
          <AddCategoryDialog />
          <AddSubcategoryDialog />
        </div>
      }
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
            placeholder="Buscar categoría o subcategoría..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <Card className="grid place-items-center px-6 py-16 text-center">
            <p className="font-display text-xl font-bold text-white">Sin resultados</p>
            <p className="mt-2 text-sm text-white/48">
              No hay categorías que coincidan con la búsqueda.
            </p>
          </Card>
        ) : (
          filteredCategories.map((category) => {
            const subs = getSubcategoriesByCategory(category.id);

            return (
              <Card key={category.id} className="overflow-hidden">
                <div className="border-b border-white/10 bg-white/[0.04] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-racing-red">
                        {category.id}
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold text-white">
                        {category.name}
                      </h2>
                      {category.description ? (
                        <p className="mt-2 text-sm leading-6 text-white/52">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex h-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/58">
                      {subs.length} subcategoría{subs.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {subs.length === 0 ? (
                    <p className="text-sm text-white/42">
                      Esta categoría aún no tiene subcategorías asignadas.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-white/10 bg-white/[0.045] p-4 transition-colors hover:border-racing-red/30"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-racing-red">
                            {sub.id}
                          </p>
                          <p className="mt-1 font-display font-bold text-white">{sub.name}</p>
                          {sub.description ? (
                            <p className="mt-2 text-xs leading-5 text-white/42">
                              {sub.description}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </ModuleShell>
  );
}
