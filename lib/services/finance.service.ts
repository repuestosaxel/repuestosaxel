import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import {
  EXPENSE_CATEGORY_TO_DB,
  mapExpense,
  mapProduct,
  mapSale,
  mapStockMovement,
  mapWorkOrder
} from "@/lib/db/mappers";
import {
  buildFinanceAlerts,
  getAverageTicket,
  getMonthlyComparison,
  getNetProfit,
  getOperationalExpenses,
  getPaymentMethodStats,
  getProductSalesIncome,
  getProfitMargin,
  getSoldUnitsCount,
  getSupplierPurchaseExpenses,
  getTodaySalesTotal,
  getTopSellingProducts,
  getTotalExpenses,
  getTotalIncome,
  getWeeklyPeriodData,
  getWorkshopIncome
} from "@/lib/finance";
import type { CreateExpenseInput, Expense, FinanceSummary } from "@/types/finance";

export async function listExpenses(): Promise<Expense[]> {
  const rows = await prisma.expense.findMany({
    orderBy: { expenseDate: "desc" }
  });

  return rows.map(mapExpense);
}

export async function createExpense(
  input: CreateExpenseInput & { createdById?: string; expenseDate?: Date }
): Promise<Expense> {
  const row = await prisma.expense.create({
    data: {
      category: EXPENSE_CATEGORY_TO_DB[input.category],
      description: input.description.trim(),
      amount: new Prisma.Decimal(input.amount),
      reference: input.reference?.trim() || null,
      supplierId: input.supplierId ?? null,
      expenseDate: input.expenseDate ?? new Date(),
      createdById: input.createdById ?? null
    }
  });

  return mapExpense(row);
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const [salesRows, workOrderRows, movementRows, expenseRows, productRows] = await Promise.all([
    prisma.sale.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.workOrder.findMany({
      include: { parts: { orderBy: { addedAt: "asc" } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.stockMovement.findMany({
      where: { type: "INGRESO_PROVEEDOR" },
      orderBy: { createdAt: "desc" }
    }),
    prisma.expense.findMany({
      orderBy: { expenseDate: "desc" }
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    })
  ]);

  const sales = salesRows.map(mapSale);
  const workOrders = workOrderRows.map(mapWorkOrder);
  const productHistory = movementRows.map(mapStockMovement);
  const expenses = expenseRows.map(mapExpense);
  const products = productRows.map(mapProduct);

  const productSalesIncome = getProductSalesIncome(sales);
  const workshopIncome = getWorkshopIncome(workOrders);
  const totalIncome = getTotalIncome(sales, workOrders);
  const supplierPurchases = getSupplierPurchaseExpenses(productHistory);
  const operationalExpenses = getOperationalExpenses(expenses);
  const totalExpenses = getTotalExpenses(productHistory, expenses);
  const netProfit = getNetProfit(totalIncome, totalExpenses);
  const profitMargin = getProfitMargin(totalIncome, totalExpenses);

  return {
    productSalesIncome,
    workshopIncome,
    totalIncome,
    supplierPurchases,
    operationalExpenses,
    totalExpenses,
    netProfit,
    profitMargin,
    todaySales: getTodaySalesTotal(sales),
    soldUnits: getSoldUnitsCount(sales),
    averageTicket: getAverageTicket(sales),
    weeklyPeriod: getWeeklyPeriodData(sales, workOrders),
    monthlyComparison: getMonthlyComparison(sales, workOrders, productHistory, expenses),
    topProducts: getTopSellingProducts(sales),
    paymentMethods: getPaymentMethodStats(sales),
    alerts: buildFinanceAlerts(products, expenses, sales)
  };
}
