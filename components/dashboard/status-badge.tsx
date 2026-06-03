import { Badge } from "@/components/ui/badge";
import type { SaleStatus } from "@/types/sales";
import type { StockStatus } from "@/types/inventory";
import type { WorkOrderStatus } from "@/types/crm";

type Status = StockStatus | SaleStatus | WorkOrderStatus;

export function StatusBadge({ status }: { status: Status }) {
  const variant =
    status === "En stock" ||
    status === "Pagado" ||
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
