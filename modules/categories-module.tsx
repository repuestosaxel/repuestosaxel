"use client";

import { useMemo, useState } from "react";
import { Layers2, Pencil, Search, Trash2 } from "lucide-react";

import { AddCategoryDialog } from "@/components/stock/add-category-dialog";
import { AddSubcategoryDialog } from "@/components/stock/add-subcategory-dialog";
import { EditCategoryDialog } from "@/components/stock/edit-category-dialog";
import { EditSubcategoryDialog } from "@/components/stock/edit-subcategory-dialog";
import { ContextBanner } from "@/components/dashboard/context-banner";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/contexts/inventory-context";
import { cn } from "@/lib/utils";
import type { Category, Subcategory } from "@/types/inventory";

export function CategoriesModule() {
  const {
    categories,
    subcategories,
    products,
    loading,
    error,
    refresh,
    getSubcategoriesByCategory,
    deleteCategory,
    deleteSubcategory
  } = useInventory();

  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);
  const [confirmDeleteSubcategoryId, setConfirmDeleteSubcategoryId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const getProductCountByCategory = (categoryId: string) =>
    products.filter((product) => product.categoryId === categoryId).length;

  const getProductCountBySubcategory = (subcategoryId: string) =>
    products.filter((product) => product.subcategoryId === subcategoryId).length;

  const handleDeleteCategory = async (category: Category) => {
    setDeleting(true);
    setActionError(null);
    try {
      await deleteCategory(category.id);
      setConfirmDeleteCategoryId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    setDeleting(true);
    setActionError(null);
    try {
      await deleteSubcategory(subcategory.id);
      setConfirmDeleteSubcategoryId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar la subcategoría.");
    } finally {
      setDeleting(false);
    }
  };

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
      <ContextBanner loading={loading} error={error} onRetry={refresh} label="categorías" />

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
            const categoryProductCount = getProductCountByCategory(category.id);
            const isConfirmingCategoryDelete = confirmDeleteCategoryId === category.id;

            return (
              <Card key={category.id} className="overflow-hidden">
                <div className="border-b border-white/10 bg-white/[0.04] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-bold text-white">{category.name}</h2>
                      {category.description ? (
                        <p className="mt-2 text-sm leading-6 text-white/52">{category.description}</p>
                      ) : null}
                      {categoryProductCount > 0 ? (
                        <p className="mt-2 text-xs text-white/38">
                          {categoryProductCount} producto{categoryProductCount === 1 ? "" : "s"} vinculado
                          {categoryProductCount === 1 ? "" : "s"}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/58">
                        {subs.length} subcategoría{subs.length === 1 ? "" : "s"}
                      </span>

                      {isConfirmingCategoryDelete ? (
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2">
                          <span className="text-xs text-red-100">¿Eliminar categoría?</span>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={deleting}
                            onClick={() => setConfirmDeleteCategoryId(null)}
                          >
                            No
                          </Button>
                          <Button
                            size="sm"
                            disabled={deleting}
                            onClick={() => void handleDeleteCategory(category)}
                          >
                            {deleting ? "..." : "Sí, eliminar"}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActionError(null);
                              setEditingCategory(category);
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
                              setConfirmDeleteCategoryId(category.id);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {subs.length === 0 ? (
                    <p className="text-sm text-white/42">
                      Esta categoría aún no tiene subcategorías asignadas.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {subs.map((sub) => {
                        const subProductCount = getProductCountBySubcategory(sub.id);
                        const isConfirmingSubDelete = confirmDeleteSubcategoryId === sub.id;

                        return (
                          <div
                            key={sub.id}
                            className={cn(
                              "rounded-xl border border-white/10 bg-white/[0.045] p-4 transition-colors hover:border-racing-red/30",
                              isConfirmingSubDelete && "border-red-500/30 bg-red-500/5"
                            )}
                          >
                            <p className="font-display font-bold text-white">{sub.name}</p>
                            {sub.description ? (
                              <p className="mt-2 text-xs leading-5 text-white/42">{sub.description}</p>
                            ) : null}
                            {subProductCount > 0 ? (
                              <p className="mt-2 text-[11px] text-white/34">
                                {subProductCount} producto{subProductCount === 1 ? "" : "s"}
                              </p>
                            ) : null}

                            <div className="mt-4 flex flex-wrap gap-2">
                              {isConfirmingSubDelete ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    disabled={deleting}
                                    onClick={() => setConfirmDeleteSubcategoryId(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={deleting}
                                    onClick={() => void handleDeleteSubcategory(sub)}
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
                                      setEditingSubcategory(sub);
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
                                      setConfirmDeleteSubcategoryId(sub.id);
                                    }}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <EditCategoryDialog
        category={editingCategory}
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
      />

      <EditSubcategoryDialog
        subcategory={editingSubcategory}
        open={Boolean(editingSubcategory)}
        onOpenChange={(open) => {
          if (!open) setEditingSubcategory(null);
        }}
      />
    </ModuleShell>
  );
}
