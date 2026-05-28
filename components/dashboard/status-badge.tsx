import { Badge } from "@/components/ui/badge";
import type { RepairStatus, SaleStatus } from "@/data/mock-data";
import type { StockStatus } from "@/types/inventory";
import type { WorkOrderStatus } from "@/types/crm";

type Status = StockStatus | SaleStatus | RepairStatus | WorkOrderStatus;

export function StatusBadge({ status }: { status: Status }) {
  const variant =
    status === "En stock" ||
    status === "Pagado" ||
    status === "Lista para entregar" ||
    status === "Finalizado" ||
    status === "Entregado"
      ? "success"
      : status === "Bajo stock" ||
          status === "Pendiente" ||
          status === "En espera" ||
          status === "Esperando repuestos"
        ? "warning"
        : status === "Diagnóstico" || status === "En reparación"
          ? "default"
          : "danger";

  return <Badge variant={variant}>{status}</Badge>;
}
