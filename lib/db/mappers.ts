import type {
  Compatibility,
  ExpenseCategory,
  PaymentMethod,
  SaleStatus,
  StockMovementType,
  WorkOrderStatus as DbWorkOrderStatus
} from "@prisma/client";

import type {
  Customer,
  Motorcycle,
  WorkOrder,
  WorkOrderPart,
  WorkOrderStatus
} from "@/types/crm";
import type { Expense, ExpenseCategory as AppExpenseCategory } from "@/types/finance";
import type {
  Category,
  CompatibilityType,
  Product,
  ProductHistoryEntry,
  ProductHistoryType,
  Subcategory,
  Supplier
} from "@/types/inventory";
import type { PaymentMethod as AppPaymentMethod, Sale, SaleLineItem, SaleStatus as AppSaleStatus } from "@/types/sales";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function decimalToNumber(value: { toNumber(): number } | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

export function formatDbDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDbDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export const WORK_ORDER_STATUS_TO_DB: Record<WorkOrderStatus, DbWorkOrderStatus> = {
  "En espera": "EN_ESPERA",
  Diagnóstico: "DIAGNOSTICO",
  "En reparación": "EN_REPARACION",
  "Esperando repuestos": "ESPERANDO_REPUESTOS",
  Finalizado: "FINALIZADO",
  Entregado: "ENTREGADO"
};

export const WORK_ORDER_STATUS_FROM_DB: Record<DbWorkOrderStatus, WorkOrderStatus> = {
  EN_ESPERA: "En espera",
  DIAGNOSTICO: "Diagnóstico",
  EN_REPARACION: "En reparación",
  ESPERANDO_REPUESTOS: "Esperando repuestos",
  FINALIZADO: "Finalizado",
  ENTREGADO: "Entregado"
};

export const SALE_STATUS_TO_DB: Record<AppSaleStatus, SaleStatus> = {
  Pagado: "PAGADO",
  Pendiente: "PENDIENTE",
  Cancelado: "CANCELADO"
};

export const SALE_STATUS_FROM_DB: Record<SaleStatus, AppSaleStatus> = {
  PAGADO: "Pagado",
  PENDIENTE: "Pendiente",
  CANCELADO: "Cancelado"
};

export const PAYMENT_METHOD_TO_DB: Record<AppPaymentMethod, PaymentMethod> = {
  Efectivo: "EFECTIVO",
  Débito: "DEBITO",
  "Mercado Pago": "MERCADO_PAGO",
  Transferencia: "TRANSFERENCIA",
  "Cuenta corriente": "CUENTA_CORRIENTE"
};

export const PAYMENT_METHOD_FROM_DB: Record<PaymentMethod, AppPaymentMethod> = {
  EFECTIVO: "Efectivo",
  DEBITO: "Débito",
  MERCADO_PAGO: "Mercado Pago",
  TRANSFERENCIA: "Transferencia",
  CUENTA_CORRIENTE: "Cuenta corriente"
};

export const STOCK_MOVEMENT_TO_APP: Record<StockMovementType, ProductHistoryType> = {
  INGRESO_PROVEEDOR: "ingreso_proveedor",
  USO_TALLER: "uso_taller",
  VENTA: "venta",
  AJUSTE_STOCK: "ajuste_stock",
  CREACION: "creacion"
};

export const STOCK_MOVEMENT_TO_DB: Record<ProductHistoryType, StockMovementType> = {
  ingreso_proveedor: "INGRESO_PROVEEDOR",
  uso_taller: "USO_TALLER",
  venta: "VENTA",
  ajuste_stock: "AJUSTE_STOCK",
  creacion: "CREACION"
};

export const EXPENSE_CATEGORY_TO_DB: Record<AppExpenseCategory, ExpenseCategory> = {
  compra_proveedor: "COMPRA_PROVEEDOR",
  reposicion_stock: "REPOSICION_STOCK",
  operativo: "OPERATIVO"
};

export const EXPENSE_CATEGORY_FROM_DB: Record<ExpenseCategory, AppExpenseCategory> = {
  COMPRA_PROVEEDOR: "compra_proveedor",
  REPOSICION_STOCK: "reposicion_stock",
  OPERATIVO: "operativo"
};

export const COMPATIBILITY_TO_DB: Record<CompatibilityType, Compatibility> = {
  Motocicletas: "MOTOCICLETAS",
  "2 tiempos": "DOS_TIEMPOS",
  "4 tiempos": "CUATRO_TIEMPOS"
};

export const COMPATIBILITY_FROM_DB: Record<Compatibility, CompatibilityType> = {
  MOTOCICLETAS: "Motocicletas",
  DOS_TIEMPOS: "2 tiempos",
  CUATRO_TIEMPOS: "4 tiempos"
};

type DbCategory = { id: string; name: string; description: string | null };
type DbSubcategory = { id: string; categoryId: string; name: string; description: string | null };
type DbSupplier = { id: string; name: string; contact: string | null; phone: string | null; email: string | null };
type DbProduct = {
  id: string;
  internalCode: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  supplierId: string;
  imageUrl: string;
  purchasePrice: { toNumber(): number };
  publicPrice: { toNumber(): number };
  stock: number;
  min: number;
  compatibility: Compatibility[];
  accent: string;
};
type DbStockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number | null;
  amount: { toNumber(): number } | null;
  detail: string;
  reference: string | null;
  supplierId: string | null;
  createdAt: Date;
};
type DbCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  accountEnabled: boolean;
  balance: { toNumber(): number };
  lastVisit: Date | null;
  createdAt: Date;
};
type DbMotorcycle = {
  id: string;
  customerId: string;
  brandModel: string;
  plate: string;
  year: number | null;
  notes: string | null;
};
type DbWorkOrderPart = {
  id: string;
  productId: string;
  productName: string;
  internalCode: string;
  quantity: number;
  unitPrice: { toNumber(): number };
  subtotal: { toNumber(): number };
  addedAt: Date;
};
type DbWorkOrder = {
  id: string;
  customerId: string;
  motorcycleId: string | null;
  problem: string;
  observations: string | null;
  status: DbWorkOrderStatus;
  mechanic: string;
  laborCost: { toNumber(): number } | null;
  createdAt: Date;
  updatedAt: Date;
  parts?: DbWorkOrderPart[];
};
type DbSaleLineItem = {
  id: string;
  productId: string;
  productName: string;
  internalCode: string;
  quantity: number;
  unitPrice: { toNumber(): number };
  subtotal: { toNumber(): number };
};
type DbSale = {
  id: string;
  reference: string;
  customerId: string | null;
  customerName: string | null;
  subtotal: { toNumber(): number };
  total: { toNumber(): number };
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes: string | null;
  createdAt: Date;
  items?: DbSaleLineItem[];
};
type DbExpense = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: { toNumber(): number };
  reference: string | null;
  supplierId: string | null;
  expenseDate: Date;
};

export function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined
  };
}

export function mapSubcategory(row: DbSubcategory): Subcategory {
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description ?? undefined
  };
}

export function mapSupplier(row: DbSupplier): Supplier {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined
  };
}

export function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    internalCode: row.internalCode,
    name: row.name,
    description: row.description,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    supplierId: row.supplierId,
    imageUrl: row.imageUrl,
    purchasePrice: decimalToNumber(row.purchasePrice),
    publicPrice: decimalToNumber(row.publicPrice),
    stock: row.stock,
    min: row.min,
    compatibility: row.compatibility.map((item) => COMPATIBILITY_FROM_DB[item]),
    accent: row.accent
  };
}

export function mapStockMovement(row: DbStockMovement): ProductHistoryEntry {
  return {
    id: row.id,
    productId: row.productId,
    type: STOCK_MOVEMENT_TO_APP[row.type],
    date: formatDbDateTime(row.createdAt),
    detail: row.detail,
    quantity: row.quantity ?? undefined,
    amount: row.amount ? decimalToNumber(row.amount) : undefined,
    supplierId: row.supplierId ?? undefined,
    reference: row.reference ?? undefined
  };
}

export function mapCustomer(row: DbCustomer): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    notes: row.notes ?? undefined,
    accountEnabled: row.accountEnabled,
    balance: decimalToNumber(row.balance),
    lastVisit: row.lastVisit ? formatDbDate(row.lastVisit) : undefined,
    createdAt: formatDbDate(row.createdAt)
  };
}

export function mapMotorcycle(row: DbMotorcycle): Motorcycle {
  return {
    id: row.id,
    customerId: row.customerId,
    brandModel: row.brandModel,
    plate: row.plate,
    year: row.year ?? undefined,
    notes: row.notes ?? undefined
  };
}

export function mapWorkOrderPart(row: DbWorkOrderPart): WorkOrderPart {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    internalCode: row.internalCode,
    quantity: row.quantity,
    unitPrice: decimalToNumber(row.unitPrice),
    subtotal: decimalToNumber(row.subtotal),
    addedAt: formatDbDateTime(row.addedAt)
  };
}

export function mapWorkOrder(row: DbWorkOrder): WorkOrder {
  return {
    id: row.id,
    customerId: row.customerId,
    motorcycleId: row.motorcycleId ?? undefined,
    problem: row.problem,
    observations: row.observations ?? undefined,
    status: WORK_ORDER_STATUS_FROM_DB[row.status],
    mechanic: row.mechanic,
    parts: row.parts?.map(mapWorkOrderPart) ?? [],
    laborCost: row.laborCost !== null ? decimalToNumber(row.laborCost) : undefined,
    createdAt: formatDbDate(row.createdAt),
    updatedAt: formatDbDateTime(row.updatedAt)
  };
}

export function mapSaleLineItem(row: DbSaleLineItem): SaleLineItem {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    internalCode: row.internalCode,
    quantity: row.quantity,
    unitPrice: decimalToNumber(row.unitPrice),
    subtotal: decimalToNumber(row.subtotal)
  };
}

export function mapSale(row: DbSale): Sale {
  return {
    id: row.id,
    reference: row.reference,
    customerId: row.customerId ?? undefined,
    customerName: row.customerName ?? undefined,
    items: row.items?.map(mapSaleLineItem) ?? [],
    subtotal: decimalToNumber(row.subtotal),
    total: decimalToNumber(row.total),
    paymentMethod: PAYMENT_METHOD_FROM_DB[row.paymentMethod],
    status: SALE_STATUS_FROM_DB[row.status],
    notes: row.notes ?? undefined,
    createdAt: formatDbDateTime(row.createdAt)
  };
}

export function mapExpense(row: DbExpense): Expense {
  return {
    id: row.id,
    category: EXPENSE_CATEGORY_FROM_DB[row.category],
    description: row.description,
    amount: decimalToNumber(row.amount),
    date: formatDbDateTime(row.expenseDate),
    reference: row.reference ?? undefined,
    supplierId: row.supplierId ?? undefined
  };
}

export function mapCompatibilities(values: CompatibilityType[]): Compatibility[] {
  return values.map((value) => COMPATIBILITY_TO_DB[value]);
}
