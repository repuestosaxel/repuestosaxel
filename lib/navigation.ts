import {
  Activity,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardCheck,
  Gauge,
  Layers2,
  ReceiptText,
  Truck,
  Users
} from "lucide-react";

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
