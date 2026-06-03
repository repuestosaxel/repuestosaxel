import { getWorkOrderGrandTotal, getWorkOrderPartsTotal } from "@/lib/crm";
import {
  filterSalesByIncome,
  formatMonthLabel,
  getDayLabel,
  getSaleMonthKey,
  isSalePendingPayment,
  parseAppDateTime
} from "@/lib/sales";
import { money } from "@/lib/utils";
import type { WorkOrder } from "@/types/crm";
import type { Product, ProductHistoryEntry } from "@/types/inventory";
import type {
  Expense,
  FinanceAlert,
  MonthlyComparisonPoint,
  PaymentMethodStat,
  PeriodPoint,
  TopProductStat
} from "@/types/finance";
import type { Sale, SaleLineItem } from "@/types/sales";

const FINISHED_WORKSHOP_STATUSES = new Set(["Finalizado", "Entregado"]);

export function getWorkshopOrderIncome(order: WorkOrder): number {
  if (!FINISHED_WORKSHOP_STATUSES.has(order.status)) return 0;
  return getWorkOrderGrandTotal(getWorkOrderPartsTotal(order.parts), order.laborCost ?? 0);
}

export function getProductSalesIncome(sales: Sale[]): number {
  return filterSalesByIncome(sales).reduce((sum, sale) => sum + sale.total, 0);
}

export function getWorkshopIncome(orders: WorkOrder[]): number {
  return orders.reduce((sum, order) => sum + getWorkshopOrderIncome(order), 0);
}

export function getTotalIncome(sales: Sale[], orders: WorkOrder[]): number {
  return getProductSalesIncome(sales) + getWorkshopIncome(orders);
}

export function getSupplierPurchaseExpenses(history: ProductHistoryEntry[]): number {
  return history
    .filter((entry) => entry.type === "ingreso_proveedor" && entry.amount)
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
}

export function getOperationalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function getTotalExpenses(history: ProductHistoryEntry[], expenses: Expense[]): number {
  return getSupplierPurchaseExpenses(history) + getOperationalExpenses(expenses);
}

export function getNetProfit(income: number, expenses: number): number {
  return income - expenses;
}

export function getProfitMargin(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return Math.round(((income - expenses) / income) * 100);
}

export function getWeeklyPeriodData(sales: Sale[], orders: WorkOrder[]): PeriodPoint[] {
  const today = new Date();
  const points: PeriodPoint[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const productSales = filterSalesByIncome(sales)
      .filter((sale) => {
        const parsed = parseAppDateTime(sale.createdAt);
        return parsed && parsed >= date && parsed < nextDate;
      })
      .reduce((sum, sale) => sum + sale.total, 0);

    const workshop = orders
      .filter((order) => {
        const parsed = parseAppDateTime(order.updatedAt);
        return (
          parsed &&
          parsed >= date &&
          parsed < nextDate &&
          FINISHED_WORKSHOP_STATUSES.has(order.status)
        );
      })
      .reduce((sum, order) => sum + getWorkshopOrderIncome(order), 0);

    points.push({
      label: getDayLabel(date),
      productSales,
      workshop,
      total: productSales + workshop
    });
  }

  return points;
}

export function getMonthlyComparison(
  sales: Sale[],
  orders: WorkOrder[],
  history: ProductHistoryEntry[],
  expenses: Expense[],
  months = 6
): MonthlyComparisonPoint[] {
  const monthKeys = new Set<string>();

  for (const sale of sales) {
    const key = getSaleMonthKey(sale.createdAt);
    if (key) monthKeys.add(key);
  }

  for (const order of orders) {
    const key = getSaleMonthKey(order.updatedAt);
    if (key) monthKeys.add(key);
  }

  for (const entry of history) {
    const key = getSaleMonthKey(entry.date);
    if (key) monthKeys.add(key);
  }

  for (const expense of expenses) {
    const key = getSaleMonthKey(expense.date);
    if (key) monthKeys.add(key);
  }

  const sortedKeys = [...monthKeys].sort().slice(-months);

  return sortedKeys.map((monthKey) => {
    const ingresosVentas = filterSalesByIncome(sales)
      .filter((sale) => getSaleMonthKey(sale.createdAt) === monthKey)
      .reduce((sum, sale) => sum + sale.total, 0);

    const ingresosTaller = orders
      .filter(
        (order) =>
          getSaleMonthKey(order.updatedAt) === monthKey &&
          FINISHED_WORKSHOP_STATUSES.has(order.status)
      )
      .reduce((sum, order) => sum + getWorkshopOrderIncome(order), 0);

    const egresosCompras = history
      .filter(
        (entry) =>
          entry.type === "ingreso_proveedor" &&
          getSaleMonthKey(entry.date) === monthKey &&
          entry.amount
      )
      .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);

    const egresosOperativos = expenses
      .filter((expense) => getSaleMonthKey(expense.date) === monthKey)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      month: formatMonthLabel(monthKey),
      ingresos: ingresosVentas + ingresosTaller,
      egresos: egresosCompras + egresosOperativos
    };
  });
}

export function getTopSellingProducts(sales: Sale[], limit = 5): TopProductStat[] {
  const map = new Map<string, TopProductStat>();

  for (const sale of filterSalesByIncome(sales)) {
    for (const item of sale.items) {
      const current = map.get(item.productId) ?? {
        productId: item.productId,
        name: item.productName,
        quantity: 0,
        revenue: 0
      };

      current.quantity += item.quantity;
      current.revenue += item.subtotal;
      map.set(item.productId, current);
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function getPaymentMethodStats(sales: Sale[]): PaymentMethodStat[] {
  const paidSales = filterSalesByIncome(sales);
  const totalAmount = paidSales.reduce((sum, sale) => sum + sale.total, 0);

  const map = new Map<string, PaymentMethodStat>();

  for (const sale of paidSales) {
    const current = map.get(sale.paymentMethod) ?? {
      method: sale.paymentMethod,
      count: 0,
      amount: 0,
      percentage: 0
    };

    current.count += 1;
    current.amount += sale.total;
    map.set(sale.paymentMethod, current);
  }

  return [...map.values()]
    .map((stat) => ({
      ...stat,
      percentage: totalAmount > 0 ? Math.round((stat.amount / totalAmount) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getCriticalStockProducts(products: Product[]): Product[] {
  return products.filter((product) => product.stock === 0 || product.stock <= product.min);
}

export function buildFinanceAlerts(
  products: Product[],
  expenses: Expense[],
  sales: Sale[]
): FinanceAlert[] {
  const alerts: FinanceAlert[] = [];

  for (const product of getCriticalStockProducts(products)) {
    alerts.push({
      id: `stock-${product.id}`,
      type: "stock_critico",
      title: product.stock === 0 ? "Sin stock" : "Stock crítico",
      detail: `${product.name} (${product.internalCode}) — ${product.stock} u. disponibles`,
      severity: product.stock === 0 ? "danger" : "warning"
    });
  }

  const relevantExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 2);

  for (const expense of relevantExpenses) {
    if (expense.amount >= 100000) {
      alerts.push({
        id: `expense-${expense.id}`,
        type: "gasto_relevante",
        title: "Gasto relevante",
        detail: `${expense.description} — ${money(expense.amount)}`,
        severity: "info"
      });
    }
  }

  const pendingSales = sales.filter((sale) => isSalePendingPayment(sale.status));
  for (const sale of pendingSales.slice(0, 3)) {
    alerts.push({
      id: `pending-${sale.id}`,
      type: "pago_pendiente",
      title: "Pago pendiente",
      detail: `${sale.reference} — ${sale.customerName ?? "Cliente mostrador"} (${money(sale.total)})`,
      severity: "warning"
    });
  }

  return alerts.slice(0, 8);
}

export function getTodaySalesTotal(sales: Sale[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return filterSalesByIncome(sales)
    .filter((sale) => {
      const parsed = parseAppDateTime(sale.createdAt);
      return parsed && parsed >= today && parsed < tomorrow;
    })
    .reduce((sum, sale) => sum + sale.total, 0);
}

export function getSoldUnitsCount(sales: Sale[]): number {
  return filterSalesByIncome(sales).reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
}

export function getAverageTicket(sales: Sale[]): number {
  const paid = filterSalesByIncome(sales);
  if (paid.length === 0) return 0;
  return Math.round(paid.reduce((sum, sale) => sum + sale.total, 0) / paid.length);
}

export function aggregateLineItems(items: SaleLineItem[]): SaleLineItem[] {
  return items;
}

export function generateExpenseId(expenses: { id: string }[]): string {
  const maxId = expenses.reduce((max, expense) => {
    const numeric = Number(expense.id.replace("EXP-", ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 100);

  return `EXP-${maxId + 1}`;
}
