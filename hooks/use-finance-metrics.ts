"use client";

import { useMemo } from "react";

import { useFinance } from "@/contexts/finance-context";
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
import { useCrm } from "@/contexts/crm-context";
import { useInventory } from "@/contexts/inventory-context";
import { useSales } from "@/contexts/sales-context";

export function useFinanceMetrics() {
  const { summary, expenses } = useFinance();
  const { sales } = useSales();
  const { workOrders } = useCrm();
  const { products } = useInventory();

  return useMemo(() => {
    if (summary) {
      return summary;
    }

    const productSalesIncome = getProductSalesIncome(sales);
    const workshopIncome = getWorkshopIncome(workOrders);
    const totalIncome = getTotalIncome(sales, workOrders);
    const supplierPurchases = 0;
    const operationalExpenses = getOperationalExpenses(expenses);
    const totalExpenses = getTotalExpenses([], expenses);
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
      monthlyComparison: getMonthlyComparison(sales, workOrders, [], expenses),
      topProducts: getTopSellingProducts(sales),
      paymentMethods: getPaymentMethodStats(sales),
      alerts: buildFinanceAlerts(products, expenses, sales)
    };
  }, [summary, sales, workOrders, products, expenses]);
}
