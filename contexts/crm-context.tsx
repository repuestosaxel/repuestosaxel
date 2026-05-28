"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  seedCustomerSales,
  seedCustomers,
  seedMotorcycles,
  seedWorkOrders
} from "@/data/crm-seed";
import {
  formatCrmDate,
  formatCrmDateTime,
  generateCustomerId,
  generateMotorcycleId,
  generateWorkOrderId,
  generateWorkOrderPartId
} from "@/lib/crm";
import type {
  AddWorkOrderPartInput,
  CreateCustomerInput,
  CreateMotorcycleInput,
  CreateWorkOrderInput,
  Customer,
  CustomerSale,
  Motorcycle,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderStatus
} from "@/types/crm";

type CrmContextValue = {
  customers: Customer[];
  motorcycles: Motorcycle[];
  customerSales: CustomerSale[];
  workOrders: WorkOrder[];
  addCustomer: (input: CreateCustomerInput) => Customer;
  addMotorcycle: (customerId: string, input: CreateMotorcycleInput) => Motorcycle;
  addWorkOrder: (input: CreateWorkOrderInput) => WorkOrder;
  updateWorkOrder: (id: string, input: UpdateWorkOrderInput) => WorkOrder | undefined;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => WorkOrder | undefined;
  addWorkOrderPart: (orderId: string, input: AddWorkOrderPartInput) => WorkOrder | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getMotorcycleById: (id: string) => Motorcycle | undefined;
  getMotorcyclesByCustomer: (customerId: string) => Motorcycle[];
  getSalesByCustomer: (customerId: string) => CustomerSale[];
  getWorkOrdersByCustomer: (customerId: string) => WorkOrder[];
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  getActiveWorkOrders: () => WorkOrder[];
};

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(seedMotorcycles);
  const [customerSales] = useState<CustomerSale[]>(seedCustomerSales);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(seedWorkOrders);

  const getCustomerById = useCallback(
    (id: string) => customers.find((customer) => customer.id === id),
    [customers]
  );

  const getMotorcycleById = useCallback(
    (id: string) => motorcycles.find((motorcycle) => motorcycle.id === id),
    [motorcycles]
  );

  const getMotorcyclesByCustomer = useCallback(
    (customerId: string) => motorcycles.filter((m) => m.customerId === customerId),
    [motorcycles]
  );

  const getSalesByCustomer = useCallback(
    (customerId: string) =>
      customerSales
        .filter((sale) => sale.customerId === customerId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [customerSales]
  );

  const getWorkOrdersByCustomer = useCallback(
    (customerId: string) =>
      workOrders
        .filter((order) => order.customerId === customerId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [workOrders]
  );

  const getWorkOrderById = useCallback(
    (id: string) => workOrders.find((order) => order.id === id),
    [workOrders]
  );

  const getActiveWorkOrders = useCallback(
    () => workOrders.filter((order) => order.status !== "Entregado"),
    [workOrders]
  );

  const addCustomer = useCallback(
    (input: CreateCustomerInput) => {
      const customer: Customer = {
        id: generateCustomerId(customers),
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        accountEnabled: input.accountEnabled,
        balance: input.accountEnabled ? (input.initialBalance ?? 0) : 0,
        lastVisit: formatCrmDate(),
        createdAt: formatCrmDate()
      };

      setCustomers((current) => [...current, customer]);

      if (input.motorcycles?.length) {
        setMotorcycles((current) => {
          const motoList = [...current];
          const created: Motorcycle[] = [];

          for (const moto of input.motorcycles!) {
            const motorcycle: Motorcycle = {
              id: generateMotorcycleId(motoList),
              customerId: customer.id,
              brandModel: moto.brandModel.trim(),
              plate: moto.plate.trim().toUpperCase(),
              year: moto.year,
              notes: moto.notes?.trim() || undefined
            };
            motoList.push(motorcycle);
            created.push(motorcycle);
          }

          return [...current, ...created];
        });
      }

      return customer;
    },
    [customers]
  );

  const addMotorcycle = useCallback(
    (customerId: string, input: CreateMotorcycleInput) => {
      const motorcycle: Motorcycle = {
        id: generateMotorcycleId(motorcycles),
        customerId,
        brandModel: input.brandModel.trim(),
        plate: input.plate.trim().toUpperCase(),
        year: input.year,
        notes: input.notes?.trim() || undefined
      };

      setMotorcycles((current) => [...current, motorcycle]);
      return motorcycle;
    },
    [motorcycles]
  );

  const addWorkOrder = useCallback(
    (input: CreateWorkOrderInput) => {
      const now = formatCrmDateTime();
      const order: WorkOrder = {
        id: generateWorkOrderId(workOrders),
        customerId: input.customerId,
        motorcycleId: input.motorcycleId || undefined,
        problem: input.problem.trim(),
        observations: input.observations?.trim() || undefined,
        status: input.status ?? "En espera",
        mechanic: input.mechanic,
        parts: [],
        laborCost: undefined,
        createdAt: formatCrmDate(),
        updatedAt: now
      };

      setWorkOrders((current) => [order, ...current]);

      setCustomers((current) =>
        current.map((customer) =>
          customer.id === input.customerId
            ? { ...customer, lastVisit: formatCrmDate() }
            : customer
        )
      );

      return order;
    },
    [workOrders]
  );

  const updateWorkOrder = useCallback(
    (id: string, input: UpdateWorkOrderInput) => {
      let updated: WorkOrder | undefined;

      setWorkOrders((current) =>
        current.map((order) => {
          if (order.id !== id) return order;

          updated = {
            ...order,
            problem: input.problem?.trim() ?? order.problem,
            observations: input.observations?.trim() ?? order.observations,
            mechanic: input.mechanic ?? order.mechanic,
            status: input.status ?? order.status,
            laborCost: input.laborCost !== undefined ? input.laborCost : order.laborCost,
            updatedAt: formatCrmDateTime()
          };

          return updated;
        })
      );

      return updated;
    },
    []
  );

  const updateWorkOrderStatus = useCallback(
    (id: string, status: WorkOrderStatus) => updateWorkOrder(id, { status }),
    [updateWorkOrder]
  );

  const addWorkOrderPart = useCallback(
    (orderId: string, input: AddWorkOrderPartInput) => {
      let updated: WorkOrder | undefined;

      setWorkOrders((current) =>
        current.map((order) => {
          if (order.id !== orderId) return order;

          const part = {
            id: generateWorkOrderPartId(order.parts),
            productId: input.productId,
            productName: input.productName,
            internalCode: input.internalCode,
            quantity: input.quantity,
            unitPrice: input.unitPrice,
            subtotal: input.unitPrice * input.quantity,
            addedAt: formatCrmDateTime()
          };

          updated = {
            ...order,
            parts: [...order.parts, part],
            updatedAt: formatCrmDateTime()
          };

          return updated;
        })
      );

      return updated;
    },
    []
  );

  const value = useMemo(
    () => ({
      customers,
      motorcycles,
      customerSales,
      workOrders,
      addCustomer,
      addMotorcycle,
      addWorkOrder,
      updateWorkOrder,
      updateWorkOrderStatus,
      addWorkOrderPart,
      getCustomerById,
      getMotorcycleById,
      getMotorcyclesByCustomer,
      getSalesByCustomer,
      getWorkOrdersByCustomer,
      getWorkOrderById,
      getActiveWorkOrders
    }),
    [
      customers,
      motorcycles,
      customerSales,
      workOrders,
      addCustomer,
      addMotorcycle,
      addWorkOrder,
      updateWorkOrder,
      updateWorkOrderStatus,
      addWorkOrderPart,
      getCustomerById,
      getMotorcycleById,
      getMotorcyclesByCustomer,
      getSalesByCustomer,
      getWorkOrdersByCustomer,
      getWorkOrderById,
      getActiveWorkOrders
    ]
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);

  if (!context) {
    throw new Error("useCrm debe usarse dentro de CrmProvider");
  }

  return context;
}
