import type { Sale, SaleLineItem, SaleStatus } from "@/types/sales";

export function generateSaleId(sales: { id: string }[]): string {
  const maxId = sales.reduce((max, sale) => {
    const numeric = Number(sale.id.replace("S-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 9000);

  return `S-${maxId + 1}`;
}

export function generateSaleReference(sales: { reference: string }[]): string {
  const maxRef = sales.reduce((max, sale) => {
    const numeric = Number(sale.reference.replace("#V-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 9017);

  return `#V-${maxRef + 1}`;
}

export function generateSaleLineItemId(items: { id: string }[]): string {
  const maxId = items.reduce((max, item) => {
    const numeric = Number(item.id.replace("SLI-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 1000);

  return `SLI-${maxId + 1}`;
}

export function formatSaleDateTime(date = new Date()): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function getSaleItemsSummary(items: Pick<SaleLineItem, "productName" | "quantity">[]): string {
  return items.map((item) => `${item.productName}${item.quantity > 1 ? ` x${item.quantity}` : ""}`).join(", ");
}

export function getSaleLineSubtotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function getSaleTotal(items: Pick<SaleLineItem, "subtotal">[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export function isSaleCountedAsIncome(status: SaleStatus): boolean {
  return status === "Pagado";
}

export function isSalePendingPayment(status: SaleStatus): boolean {
  return status === "Pendiente";
}

const MONTH_MAP: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11
};

export function parseAppDateTime(value: string): Date | null {
  const normalized = value.trim().toLowerCase();
  const match = normalized.match(
    /(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+(\d{4})(?:,\s*(\d{1,2}):(\d{2}))?/
  );

  if (!match) return null;

  const day = Number(match[1]);
  const month = MONTH_MAP[match[2]];
  const year = Number(match[3]);
  const hours = match[4] ? Number(match[4]) : 0;
  const minutes = match[5] ? Number(match[5]) : 0;

  if (month === undefined) return null;

  return new Date(year, month, day, hours, minutes);
}

export function getSaleMonthKey(date: string): string | null {
  const parsed = parseAppDateTime(date);
  if (!parsed) return null;

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;

  return new Intl.DateTimeFormat("es-AR", { month: "short" }).format(new Date(year, month - 1, 1));
}

export function getDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date);
}

export function filterSalesByIncome<T extends { status: SaleStatus }>(sales: T[]): T[] {
  return sales.filter((sale) => isSaleCountedAsIncome(sale.status));
}
