import { Badge } from "@/components/ui/badge";
import type { RepairStatus, SaleStatus, StockStatus } from "@/data/mock-data";

type Status = StockStatus | SaleStatus | RepairStatus;

export function StatusBadge({ status }: { status: Status }) {
  const variant =
    status === "En stock" || status === "Pagado" || status === "Lista para entregar"
      ? "success"
      : status === "Bajo stock" || status === "Pendiente" || status === "En espera"
        ? "warning"
        : "danger";

  return <Badge variant={variant}>{status}</Badge>;
}
