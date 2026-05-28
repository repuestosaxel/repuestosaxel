import type { Customer, WorkOrderStatus } from "@/types/crm";
import { WORK_ORDER_STATUSES } from "@/types/crm";

export function generateCustomerId(customers: { id: string }[]): string {
  const maxId = customers.reduce((max, customer) => {
    const numeric = Number(customer.id.replace("C-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 100);

  return `C-${maxId + 1}`;
}

export function generateMotorcycleId(motorcycles: { id: string }[]): string {
  const maxId = motorcycles.reduce((max, motorcycle) => {
    const numeric = Number(motorcycle.id.replace("M-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 100);

  return `M-${maxId + 1}`;
}

export function generateCustomerSaleId(sales: { id: string }[]): string {
  const maxId = sales.reduce((max, sale) => {
    const numeric = Number(sale.id.replace("CS-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 1000);

  return `CS-${maxId + 1}`;
}

export function generateWorkOrderId(orders: { id: string }[]): string {
  const maxId = orders.reduce((max, order) => {
    const numeric = Number(order.id.replace("T-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 300);

  return `T-${maxId + 1}`;
}

export function formatCrmDate(date = new Date()): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatCrmDateTime(date = new Date()): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function getWorkOrderProgress(status: WorkOrderStatus): number {
  const index = WORK_ORDER_STATUSES.indexOf(status);
  if (index <= 0) return 10;
  return Math.round(((index + 1) / WORK_ORDER_STATUSES.length) * 100);
}

export type AccountBalanceState = "debt" | "credit" | "clear";

export function getAccountBalanceState(balance: number): AccountBalanceState {
  if (balance < 0) return "debt";
  if (balance > 0) return "credit";
  return "clear";
}

export function getAccountBalanceLabel(customer: Pick<Customer, "accountEnabled" | "balance">): string {
  if (!customer.accountEnabled) return "Sin cuenta corriente";

  const state = getAccountBalanceState(customer.balance);
  if (state === "debt") return "Con deuda";
  if (state === "credit") return "Saldo a favor";
  return "Al día";
}

export function isWorkOrderActive(status: WorkOrderStatus): boolean {
  return status !== "Entregado";
}

export const PARTS_ALLOWED_STATUSES: WorkOrderStatus[] = [
  "En reparación",
  "Esperando repuestos",
  "Finalizado",
  "Entregado"
];

export const LABOR_EDITABLE_STATUSES: WorkOrderStatus[] = ["Finalizado", "Entregado"];

export function canAddPartsToWorkOrder(status: WorkOrderStatus): boolean {
  return PARTS_ALLOWED_STATUSES.includes(status);
}

export function canEditLaborCost(status: WorkOrderStatus): boolean {
  return LABOR_EDITABLE_STATUSES.includes(status);
}

export function getWorkOrderPartsTotal(parts: { subtotal: number }[]): number {
  return parts.reduce((sum, part) => sum + part.subtotal, 0);
}

export function getWorkOrderGrandTotal(partsTotal: number, laborCost = 0): number {
  return partsTotal + laborCost;
}

export function generateWorkOrderPartId(parts: { id: string }[]): string {
  const maxId = parts.reduce((max, part) => {
    const numeric = Number(part.id.replace("WOP-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 1000);

  return `WOP-${maxId + 1}`;
}
