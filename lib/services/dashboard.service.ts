import { prisma } from "@/lib/db/prisma";
import { mapExpense, mapSale, mapStockMovement, mapWorkOrder } from "@/lib/db/mappers";
import {
  filterSalesByIncome,
  getSaleMonthKey,
  isSalePendingPayment,
  parseAppDateTime
} from "@/lib/sales";
import {
  getMonthlyComparison,
  getTodaySalesTotal,
  getTopSellingProducts,
  getWeeklyPeriodData
} from "@/lib/finance";
import { getFinanceSummary } from "@/lib/services/finance.service";
import type {
  DashboardActivity,
  DashboardMetrics,
  DashboardStat
} from "@/types/dashboard";

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function percentChange(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "0%";
  }

  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Hace un momento";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

async function buildActivities(
  sales: ReturnType<typeof mapSale>[],
  workOrders: ReturnType<typeof mapWorkOrder>[]
): Promise<DashboardActivity[]> {
  const activities: { at: Date; item: DashboardActivity }[] = [];

  for (const sale of sales.slice(0, 5)) {
    const parsed = parseAppDateTime(sale.createdAt);
    if (!parsed) continue;

    activities.push({
      at: parsed,
      item: {
        title: isSalePendingPayment(sale.status) ? "Pago pendiente" : "Venta cerrada",
        detail: `${sale.reference} — ${sale.customerName ?? "Cliente mostrador"}`,
        time: relativeTime(parsed)
      }
    });
  }

  for (const order of workOrders.slice(0, 5)) {
    if (order.status !== "Finalizado" && order.status !== "Entregado") continue;

    const parsed = parseAppDateTime(order.updatedAt);
    if (!parsed) continue;

    activities.push({
      at: parsed,
      item: {
        title: "Moto lista",
        detail: `${order.problem.slice(0, 60)}${order.problem.length > 60 ? "…" : ""}`,
        time: relativeTime(parsed)
      }
    });
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { updatedAt: "desc" },
    take: 50
  });

  for (const product of products.filter((p) => p.stock === 0 || p.stock <= p.min).slice(0, 3)) {
    activities.push({
      at: product.updatedAt,
      item: {
        title: product.stock === 0 ? "Sin stock" : "Stock crítico",
        detail: `${product.name} (${product.internalCode})`,
        time: relativeTime(product.updatedAt)
      }
    });
  }

  return activities
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8)
    .map((entry) => entry.item);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 7);

  const [
    salesRows,
    workOrderRows,
    movementRows,
    expenseRows,
    productRows,
    categoryRows,
    todaySalesAgg,
    yesterdaySalesAgg,
    newCustomersWeek,
    activeWorkOrders,
    readyWorkOrders
  ] = await Promise.all([
    prisma.sale.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.workOrder.findMany({
      include: { parts: { orderBy: { addedAt: "asc" } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.stockMovement.findMany({
      where: { type: "INGRESO_PROVEEDOR" },
      orderBy: { createdAt: "desc" }
    }),
    prisma.expense.findMany({ orderBy: { expenseDate: "desc" } }),
    prisma.product.findMany({ where: { active: true } }),
    prisma.category.findMany({
      include: {
        products: {
          where: { active: true },
          include: {
            saleLineItems: {
              where: { sale: { status: "PAGADO" } },
              select: { subtotal: true }
            }
          }
        }
      }
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { status: "PAGADO", createdAt: { gte: today, lt: tomorrow } }
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        status: "PAGADO",
        createdAt: { gte: yesterday, lt: today }
      }
    }),
    prisma.customer.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.workOrder.count({
      where: { status: { notIn: ["ENTREGADO", "FINALIZADO"] } }
    }),
    prisma.workOrder.count({ where: { status: "FINALIZADO" } })
  ]);

  const sales = salesRows.map(mapSale);
  const workOrders = workOrderRows.map(mapWorkOrder);
  const productHistory = movementRows.map(mapStockMovement);
  const expenses = expenseRows.map(mapExpense);

  const todaySales = Number(todaySalesAgg._sum.total ?? 0);
  const yesterdaySales = Number(yesterdaySalesAgg._sum.total ?? 0);

  const monthSales = filterSalesByIncome(sales)
    .filter((sale) => getSaleMonthKey(sale.createdAt) === monthKey)
    .reduce((sum, sale) => sum + sale.total, 0);

  const prevMonthSales = filterSalesByIncome(sales)
    .filter((sale) => getSaleMonthKey(sale.createdAt) === prevMonthKey)
    .reduce((sum, sale) => sum + sale.total, 0);

  const lowStockCount = productRows.filter(
    (product) => product.stock === 0 || product.stock <= product.min
  ).length;

  const criticalCount = productRows.filter((product) => product.stock === 0).length;

  const finance = await getFinanceSummary();

  const stats: DashboardStat[] = [
    {
      title: "Ventas del día",
      value: todaySales || getTodaySalesTotal(sales),
      trend: percentChange(todaySales, yesterdaySales),
      label: "vs. ayer"
    },
    {
      title: "Ventas del mes",
      value: monthSales,
      trend: percentChange(monthSales, prevMonthSales),
      label: "vs. mes anterior"
    },
    {
      title: "Bajo stock",
      value: lowStockCount,
      trend: `${criticalCount} críticos`,
      label: "requieren compra"
    },
    {
      title: "Reparaciones activas",
      value: activeWorkOrders,
      trend: `${readyWorkOrders} listas`,
      label: "para entregar"
    },
    {
      title: "Clientes nuevos",
      value: newCustomersWeek,
      trend: "últimos 7 días",
      label: "registrados"
    },
    {
      title: "Ganancia mensual",
      value: finance.netProfit,
      trend: `${finance.profitMargin}% margen`,
      label: "estimado"
    }
  ];

  const weeklySales = getWeeklyPeriodData(sales, workOrders).map((point) => ({
    day: point.label,
    ventas: point.productSales,
    taller: point.workshop
  }));

  const topProducts = getTopSellingProducts(sales, 5).map((item) => ({
    name: item.name,
    ventas: item.quantity,
    revenue: item.revenue
  }));

  const monthlyIncome = getMonthlyComparison(sales, workOrders, productHistory, expenses, 6).map(
    (point) => ({
      month: point.month,
      ingresos: point.ingresos,
      egresos: point.egresos
    })
  );

  const categorySales = categoryRows
    .map((category) => ({
      name: category.name,
      value: Math.round(
        category.products.reduce(
          (sum, product) =>
            sum +
            product.saleLineItems.reduce((lineSum, line) => lineSum + Number(line.subtotal), 0),
          0
        )
      )
    }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const activities = await buildActivities(sales, workOrders);

  return {
    stats,
    weeklySales,
    topProducts,
    monthlyIncome,
    categorySales,
    activities
  };
}
