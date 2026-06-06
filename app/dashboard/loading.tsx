import { DashboardOverviewSkeleton } from "@/components/dashboard/data-loading";
import { ModuleShell } from "@/components/dashboard/module-shell";

export default function DashboardLoading() {
  return (
    <ModuleShell
      eyebrow="Centro de comando"
      title="Performance del negocio en tiempo real"
      description="Una vista ejecutiva para controlar ventas, stock, taller y flujo financiero con foco en velocidad y decisión."
    >
      <DashboardOverviewSkeleton />
    </ModuleShell>
  );
}
