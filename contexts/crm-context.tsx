"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { api } from "@/lib/api/client";
import type {
  CreateCustomerInput,
  CreateMotorcycleInput,
  CreateWorkOrderInput,
  CrmSnapshot,
  Customer,
  Motorcycle,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderStatus
} from "@/types/crm";

type CrmContextValue = {
  customers: Customer[];
  motorcycles: Motorcycle[];
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCustomer: (input: CreateCustomerInput) => Promise<Customer>;
  addMotorcycle: (customerId: string, input: CreateMotorcycleInput) => Promise<Motorcycle>;
  addWorkOrder: (input: CreateWorkOrderInput) => Promise<WorkOrder>;
  updateWorkOrder: (id: string, input: UpdateWorkOrderInput) => Promise<WorkOrder | undefined>;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => Promise<WorkOrder | undefined>;
  getCustomerById: (id: string) => Customer | undefined;
  getMotorcycleById: (id: string) => Motorcycle | undefined;
  getMotorcyclesByCustomer: (customerId: string) => Motorcycle[];
  getWorkOrdersByCustomer: (customerId: string) => WorkOrder[];
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  getActiveWorkOrders: () => WorkOrder[];
};

const CrmContext = createContext<CrmContextValue | null>(null);

async function fetchCrmSnapshot(): Promise<CrmSnapshot> {
  const [customers, motorcycles, workOrders] = await Promise.all([
    api.get<Customer[]>("/api/customers"),
    api.get<Motorcycle[]>("/api/motorcycles"),
    api.get<WorkOrder[]>("/api/work-orders")
  ]);

  return { customers, motorcycles, workOrders };
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySnapshot = useCallback((snapshot: CrmSnapshot) => {
    setCustomers(snapshot.customers);
    setMotorcycles(snapshot.motorcycles);
    setWorkOrders(snapshot.workOrders);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const snapshot = await fetchCrmSnapshot();
      applySnapshot(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar CRM.");
    } finally {
      setLoading(false);
    }
  }, [applySnapshot]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  const addCustomer = useCallback(async (input: CreateCustomerInput) => {
    const customer = await api.post<Customer>("/api/customers", input);
    setCustomers((current) => [...current, customer]);
    await refresh();
    return customer;
  }, [refresh]);

  const addMotorcycle = useCallback(async (customerId: string, input: CreateMotorcycleInput) => {
    const motorcycle = await api.post<Motorcycle>("/api/motorcycles", {
      customerId,
      ...input
    });
    setMotorcycles((current) => [...current, motorcycle]);
    return motorcycle;
  }, []);

  const addWorkOrder = useCallback(async (input: CreateWorkOrderInput) => {
    const order = await api.post<WorkOrder>("/api/work-orders", input);
    setWorkOrders((current) => [order, ...current]);
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === input.customerId ? { ...customer, lastVisit: order.createdAt } : customer
      )
    );
    return order;
  }, []);

  const updateWorkOrder = useCallback(async (id: string, input: UpdateWorkOrderInput) => {
    const order = await api.patch<WorkOrder>(`/api/work-orders/${id}`, input);
    setWorkOrders((current) => current.map((item) => (item.id === id ? order : item)));
    return order;
  }, []);

  const updateWorkOrderStatus = useCallback(
    async (id: string, status: WorkOrderStatus) => updateWorkOrder(id, { status }),
    [updateWorkOrder]
  );

  const value = useMemo(
    () => ({
      customers,
      motorcycles,
      workOrders,
      loading,
      error,
      refresh,
      addCustomer,
      addMotorcycle,
      addWorkOrder,
      updateWorkOrder,
      updateWorkOrderStatus,
      getCustomerById,
      getMotorcycleById,
      getMotorcyclesByCustomer,
      getWorkOrdersByCustomer,
      getWorkOrderById,
      getActiveWorkOrders
    }),
    [
      customers,
      motorcycles,
      workOrders,
      loading,
      error,
      refresh,
      addCustomer,
      addMotorcycle,
      addWorkOrder,
      updateWorkOrder,
      updateWorkOrderStatus,
      getCustomerById,
      getMotorcycleById,
      getMotorcyclesByCustomer,
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
