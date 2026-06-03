export type SaleStatus = "Pagado" | "Pendiente" | "Cancelado";

export type PaymentMethod =
  | "Efectivo"
  | "Débito"
  | "Mercado Pago"
  | "Transferencia"
  | "Cuenta corriente";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Efectivo",
  "Débito",
  "Mercado Pago",
  "Transferencia",
  "Cuenta corriente"
];

export const SALE_STATUSES: SaleStatus[] = ["Pagado", "Pendiente", "Cancelado"];

export type SaleLineItem = {
  id: string;
  productId: string;
  productName: string;
  internalCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Sale = {
  id: string;
  reference: string;
  customerId?: string;
  customerName?: string;
  items: SaleLineItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  createdAt: string;
};

export type CreateSaleLineInput = {
  productId: string;
  quantity: number;
};

export type CreateSaleInput = {
  items: CreateSaleLineInput[];
  customerId?: string;
  paymentMethod: PaymentMethod;
  status?: SaleStatus;
  notes?: string;
};

export type SaleCartItem = {
  productId: string;
  productName: string;
  internalCode: string;
  quantity: number;
  unitPrice: number;
  stock: number;
};
