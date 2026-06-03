export type ExpenseCategory = "compra_proveedor" | "reposicion_stock" | "operativo";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  compra_proveedor: "Compra a proveedor",
  reposicion_stock: "Reposición de stock",
  operativo: "Gasto operativo"
};

export type Expense = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  supplierId?: string;
};

export type CreateExpenseInput = {
  category: ExpenseCategory;
  description: string;
  amount: number;
  reference?: string;
  supplierId?: string;
};

export type FinanceAlert = {
  id: string;
  type: "stock_critico" | "gasto_relevante" | "pago_pendiente";
  title: string;
  detail: string;
  severity: "warning" | "danger" | "info";
};

export type PaymentMethodStat = {
  method: string;
  count: number;
  amount: number;
  percentage: number;
};

export type TopProductStat = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type PeriodPoint = {
  label: string;
  productSales: number;
  workshop: number;
  total: number;
};

export type MonthlyComparisonPoint = {
  month: string;
  ingresos: number;
  egresos: number;
};

export type FinanceSummary = {
  productSalesIncome: number;
  workshopIncome: number;
  totalIncome: number;
  supplierPurchases: number;
  operationalExpenses: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  todaySales: number;
  soldUnits: number;
  averageTicket: number;
  weeklyPeriod: PeriodPoint[];
  monthlyComparison: MonthlyComparisonPoint[];
  topProducts: TopProductStat[];
  paymentMethods: PaymentMethodStat[];
  alerts: FinanceAlert[];
};
