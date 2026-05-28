import { Badge } from "@/components/ui/badge";
import type { WorkOrderStatus } from "@/types/crm";

const statusVariants: Record<
  WorkOrderStatus,
  "default" | "success" | "warning" | "danger" | "neutral" | "outline"
> = {
  "En espera": "warning",
  Diagnóstico: "outline",
  "En reparación": "default",
  "Esperando repuestos": "warning",
  Finalizado: "success",
  Entregado: "neutral"
};

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
