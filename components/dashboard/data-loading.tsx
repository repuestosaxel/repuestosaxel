"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ContextBanner } from "@/components/dashboard/context-banner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingProgressStrip() {
  return (
    <div
      className="relative h-1 overflow-hidden rounded-full bg-white/[0.06]"
      role="progressbar"
      aria-label="Cargando datos"
    >
      <div className="absolute inset-y-0 w-2/5 animate-pulse-line rounded-full bg-gradient-to-r from-transparent via-racing-red/90 to-transparent" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-8 w-36" />
        </div>
        <Skeleton className="size-11 shrink-0 rounded-xl" />
      </div>
      <div className="mt-5 flex items-center gap-2">
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}

export function StatCardsSkeleton({
  count = 4,
  className
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

function ChartCardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <Card className={cn("min-h-[340px] p-5", tall && "min-h-[380px]")}>
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </div>
      <div className="mt-6 flex h-[250px] items-end gap-2 px-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            className="flex-1 rounded-t-md"
            style={{ height: `${38 + ((index * 17) % 55)}%` }}
          />
        ))}
      </div>
    </Card>
  );
}

export function ChartCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <ChartCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function FilterBarSkeleton({ pills = 4, wide = false }: { pills?: number; wide?: boolean }) {
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <Skeleton className={cn("h-11", wide ? "w-full max-w-xl" : "w-full max-w-md")} />
      {pills > 0 ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: pills }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export function StockFiltersSkeleton() {
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <Skeleton className="h-11 w-full max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[5/4] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3.5 w-1/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function CatalogGridSkeleton({
  items = 6,
  columns = "sm:grid-cols-2 xl:grid-cols-3"
}: {
  items?: number;
  columns?: string;
}) {
  return (
    <div className={cn("grid gap-4", columns)}>
      {Array.from({ length: items }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
        <div className="flex gap-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/8">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-14 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function CategoryListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="border-b border-white/10 bg-white/[0.04] p-5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-3 h-4 w-full max-w-lg" />
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, subIndex) => (
              <Skeleton key={subIndex} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SettingsFormSkeleton() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-5">
      <LoadingProgressStrip />
      <StatCardsSkeleton count={6} className="xl:grid-cols-3" />
      <ChartCardsSkeleton count={2} />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartCardSkeleton tall />
        <Card className="min-h-[340px] p-5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mx-auto mt-10 size-44 rounded-full" />
        </Card>
      </div>
      <Card className="p-5">
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function CatalogModuleSkeleton({
  statCount = 4,
  gridItems = 6,
  filterPills = 0,
  statColumns
}: {
  statCount?: number;
  gridItems?: number;
  filterPills?: number;
  statColumns?: string;
}) {
  return (
    <div className="space-y-5">
      <LoadingProgressStrip />
      <StatCardsSkeleton count={statCount} className={statColumns} />
      <FilterBarSkeleton pills={filterPills} />
      <CatalogGridSkeleton items={gridItems} />
    </div>
  );
}

export function StockModuleSkeleton() {
  return (
    <div className="space-y-5">
      <LoadingProgressStrip />
      <StatCardsSkeleton count={4} />
      <StockFiltersSkeleton />
      <CatalogGridSkeleton items={6} />
    </div>
  );
}

export function FinanceModuleSkeleton() {
  return (
    <div className="space-y-5">
      <LoadingProgressStrip />
      <StatCardsSkeleton count={4} />
      <ChartCardsSkeleton count={2} />
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <Card className="min-h-[340px] p-5">
          <Skeleton className="h-5 w-36" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

type ModuleDataGateProps = {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  skeleton: ReactNode;
  children: ReactNode;
};

export function ModuleDataGate({
  loading,
  error,
  onRetry,
  skeleton,
  children
}: ModuleDataGateProps) {
  return (
    <>
      <ContextBanner error={error} onRetry={onRetry} />
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="space-y-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
