export type WorkOrderStatus =
  | "En espera"
  | "Diagnóstico"
  | "En reparación"
  | "Esperando repuestos"
  | "Finalizado"
  | "Entregado";

export const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  "En espera",
  "Diagnóstico",
  "En reparación",
  "Esperando repuestos",
  "Finalizado",
  "Entregado"
];

export const WORKSHOP_MECHANICS = [
  "Ezequiel R.",
  "Nicolás P.",
  "Alan G.",
  "Marcos V.",
  "Diego L."
] as const;

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  accountEnabled: boolean;
  /** Negativo = deuda, positivo = saldo a favor, 0 = al día */
  balance: number;
  lastVisit?: string;
  createdAt: string;
};

export type Motorcycle = {
  id: string;
  customerId: string;
  brandModel: string;
  plate: string;
  year?: number;
  notes?: string;
};

export type WorkOrderPart = {
  id: string;
  productId: string;
  productName: string;
  internalCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  addedAt: string;
};

export type WorkOrder = {
  id: string;
  customerId: string;
  motorcycleId?: string;
  problem: string;
  observations?: string;
  status: WorkOrderStatus;
  mechanic: string;
  parts: WorkOrderPart[];
  laborCost?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMotorcycleInput = {
  brandModel: string;
  plate: string;
  year?: number;
  notes?: string;
};

export type CrmSnapshot = {
  customers: Customer[];
  motorcycles: Motorcycle[];
  workOrders: WorkOrder[];
};

export type UpdateCustomerInput = {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  accountEnabled?: boolean;
  balance?: number;
};

export type CreateMotorcycleWithCustomerInput = CreateMotorcycleInput & {
  customerId: string;
};

export type CreateCustomerInput = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  accountEnabled: boolean;
  initialBalance?: number;
  motorcycles?: CreateMotorcycleInput[];
};

export type CreateWorkOrderInput = {
  customerId: string;
  motorcycleId?: string;
  problem: string;
  observations?: string;
  mechanic: string;
  status?: WorkOrderStatus;
};

export type UpdateWorkOrderInput = {
  status?: WorkOrderStatus;
  observations?: string;
  mechanic?: string;
  problem?: string;
  laborCost?: number;
};

export type AddWorkOrderPartInput = {
  productId: string;
  productName: string;
  internalCode: string;
  quantity: number;
  unitPrice: number;
};

export type AddWorkOrderPartPayload = {
  productId: string;
  quantity: number;
};

export type ClientFilter = "todos" | "con_motos" | "solo_repuestos" | "cuenta_corriente";
