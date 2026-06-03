export type DashboardStat = {
  title: string;
  value: number;
  trend: string;
  label: string;
};

export type DashboardWeeklyPoint = {
  day: string;
  ventas: number;
  taller: number;
};

export type DashboardTopProduct = {
  name: string;
  ventas: number;
  revenue: number;
};

export type DashboardMonthlyPoint = {
  month: string;
  ingresos: number;
  egresos: number;
};

export type DashboardCategorySlice = {
  name: string;
  value: number;
};

export type DashboardActivity = {
  title: string;
  detail: string;
  time: string;
};

export type DashboardMetrics = {
  stats: DashboardStat[];
  weeklySales: DashboardWeeklyPoint[];
  topProducts: DashboardTopProduct[];
  monthlyIncome: DashboardMonthlyPoint[];
  categorySales: DashboardCategorySlice[];
  activities: DashboardActivity[];
};
