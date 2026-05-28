"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { InventoryProvider } from "@/contexts/inventory-context";
import { CrmProvider } from "@/contexts/crm-context";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import type { ModuleId } from "@/data/mock-data";
import { CategoriesModule } from "@/modules/categories-module";
import { ClientsModule } from "@/modules/clients-module";
import { DashboardOverview } from "@/modules/dashboard-overview";
import { FinanceModule } from "@/modules/finance-module";
import { SalesModule } from "@/modules/sales-module";
import { SimpleModule } from "@/modules/simple-module";
import { StockModule } from "@/modules/stock-module";
import { SuppliersModule } from "@/modules/suppliers-module";
import { WorkshopModule } from "@/modules/workshop-module";

const modules: Record<ModuleId, React.ReactNode> = {
  dashboard: <DashboardOverview />,
  stock: <StockModule />,
  categorias: <CategoriesModule />,
  proveedores: <SuppliersModule />,
  ventas: <SalesModule />,
  clientes: <ClientsModule />,
  taller: <WorkshopModule />,
  finanzas: <FinanceModule />,
  reportes: <SimpleModule type="reportes" />,
  configuracion: <SimpleModule type="configuracion" />
};

export function DashboardClient() {
  const [active, setActive] = useState<ModuleId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <InventoryProvider>
      <CrmProvider>
        <div className="min-h-screen bg-background">
        <div className="pointer-events-none fixed inset-0 bg-red-sweep" />
        <div className="relative flex">
          <Sidebar
            active={active}
            onChange={setActive}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="min-w-0 flex-1">
            <Topbar onMenu={() => setSidebarOpen(true)} />
            <AnimatePresence mode="wait">
              <motion.main
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                {modules[active]}
              </motion.main>
            </AnimatePresence>
          </div>
        </div>
        </div>
      </CrmProvider>
    </InventoryProvider>
  );
}
