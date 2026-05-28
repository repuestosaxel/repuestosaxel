import {
  Activity,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Gauge,
  HandCoins,
  Layers2,
  PackageSearch,
  ReceiptText,
  TrendingUp,
  Truck,
  Users
} from "lucide-react";

export type SaleStatus = "Pagado" | "Pendiente" | "Cancelado";

/** @deprecated Usar WorkOrderStatus desde @/types/crm */
export type RepairStatus = "En espera" | "En reparación" | "Lista para entregar";

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "stock", label: "Stock", icon: Boxes },
  { id: "categorias", label: "Categorías", icon: Layers2 },
  { id: "proveedores", label: "Proveedores", icon: Truck },
  { id: "ventas", label: "Ventas", icon: ReceiptText },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "taller", label: "Taller", icon: ClipboardCheck },
  { id: "finanzas", label: "Finanzas", icon: CircleDollarSign },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "configuracion", label: "Configuración", icon: Activity }
] as const;

export type ModuleId = (typeof navItems)[number]["id"];

export const dashboardStats = [
  {
    title: "Ventas del día",
    value: 742500,
    trend: "+18.4%",
    label: "vs. ayer",
    icon: HandCoins,
    tone: "red"
  },
  {
    title: "Ventas del mes",
    value: 18450000,
    trend: "+24.1%",
    label: "objetivo 82%",
    icon: TrendingUp,
    tone: "white"
  },
  {
    title: "Bajo stock",
    value: 11,
    trend: "5 críticos",
    label: "requieren compra",
    icon: PackageSearch,
    tone: "amber"
  },
  {
    title: "Reparaciones activas",
    value: 9,
    trend: "3 listas",
    label: "para entregar",
    icon: ClipboardCheck,
    tone: "green"
  },
  {
    title: "Clientes nuevos",
    value: 17,
    trend: "+6",
    label: "esta semana",
    icon: Users,
    tone: "blue"
  },
  {
    title: "Ganancia mensual",
    value: 6120000,
    trend: "+14.8%",
    label: "margen estimado",
    icon: CircleDollarSign,
    tone: "red"
  }
];

export const weeklySales = [
  { day: "Lun", ventas: 620000, taller: 180000 },
  { day: "Mar", ventas: 710000, taller: 240000 },
  { day: "Mié", ventas: 880000, taller: 210000 },
  { day: "Jue", ventas: 790000, taller: 330000 },
  { day: "Vie", ventas: 1120000, taller: 360000 },
  { day: "Sáb", ventas: 1340000, taller: 420000 },
  { day: "Dom", ventas: 520000, taller: 120000 }
];

export const monthlyIncome = [
  { month: "Ene", ingresos: 9800000, egresos: 6100000 },
  { month: "Feb", ingresos: 11200000, egresos: 6800000 },
  { month: "Mar", ingresos: 12600000, egresos: 7600000 },
  { month: "Abr", ingresos: 15100000, egresos: 8500000 },
  { month: "May", ingresos: 18450000, egresos: 10300000 },
  { month: "Jun", ingresos: 17200000, egresos: 9600000 }
];

export const topProducts = [
  { name: "Motul 5100", ventas: 86, revenue: 4128000 },
  { name: "Pastillas Brembo", ventas: 64, revenue: 2432000 },
  { name: "Pirelli Diablo", ventas: 41, revenue: 4756000 },
  { name: "Casco LS2", ventas: 36, revenue: 3960000 },
  { name: "Kit Riffel", ventas: 28, revenue: 3108000 }
];

export const categorySales = [
  { name: "Lubricantes", value: 34 },
  { name: "Cubiertas", value: 24 },
  { name: "Cascos", value: 17 },
  { name: "Frenos", value: 14 },
  { name: "Transmisión", value: 11 }
];

export const recentSales = [
  {
    id: "#V-9018",
    customer: "Matías Ferreyra",
    date: "Hoy 11:42",
    amount: 186000,
    method: "Mercado Pago",
    status: "Pagado" as SaleStatus,
    items: "Motul 5100, filtro, bujía NGK"
  },
  {
    id: "#V-9017",
    customer: "Sofía Martínez",
    date: "Hoy 10:18",
    amount: 110000,
    method: "Débito",
    status: "Pagado" as SaleStatus,
    items: "Casco LS2 FF353"
  },
  {
    id: "#V-9016",
    customer: "Lucas Benítez",
    date: "Ayer 18:04",
    amount: 294000,
    method: "Transferencia",
    status: "Pendiente" as SaleStatus,
    items: "Cubierta Pirelli + colocación"
  },
  {
    id: "#V-9015",
    customer: "Nicolás Medina",
    date: "Ayer 16:33",
    amount: 38000,
    method: "Efectivo",
    status: "Cancelado" as SaleStatus,
    items: "Pastillas Brembo"
  }
];

export const activities = [
  { title: "Venta cerrada", detail: "Matías compró Motul 5100 + filtro de aceite", time: "Hace 6 min" },
  { title: "Stock crítico", detail: "Kit transmisión Riffel quedó sin unidades", time: "Hace 28 min" },
  { title: "Moto lista", detail: "Zanella RX 150 finalizó prueba de ruta", time: "Hace 44 min" },
  { title: "Pago pendiente", detail: "Lucas tiene transferencia por confirmar", time: "Hace 1 h" }
];

export const paymentMethods = [
  { method: "Mercado Pago", value: 46, icon: CreditCard },
  { method: "Transferencia", value: 27, icon: HandCoins },
  { method: "Efectivo", value: 18, icon: CircleDollarSign },
  { method: "Débito", value: 9, icon: CreditCard }
];
