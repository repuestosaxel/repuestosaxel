import { Prisma } from "@prisma/client";

import { canAddPartsToWorkOrder } from "@/lib/crm";
import { prisma } from "@/lib/db/prisma";
import {
  mapCustomer,
  mapMotorcycle,
  mapWorkOrder,
  WORK_ORDER_STATUS_FROM_DB,
  WORK_ORDER_STATUS_TO_DB
} from "@/lib/db/mappers";
import { consumeStock } from "@/lib/services/inventory.service";
import type {
  AddWorkOrderPartInput,
  AddWorkOrderPartPayload,
  CreateCustomerInput,
  CreateMotorcycleWithCustomerInput,
  CreateWorkOrderInput,
  CrmSnapshot,
  Customer,
  Motorcycle,
  UpdateCustomerInput,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderStatus
} from "@/types/crm";

export type CrmOperationResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listCrmSnapshot(): Promise<CrmSnapshot> {
  const [customers, motorcycles, workOrders] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.motorcycle.findMany({ orderBy: { plate: "asc" } }),
    prisma.workOrder.findMany({
      include: { parts: { orderBy: { addedAt: "asc" } } },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return {
    customers: customers.map(mapCustomer),
    motorcycles: motorcycles.map(mapMotorcycle),
    workOrders: workOrders.map(mapWorkOrder)
  };
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const row = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        notes: input.notes?.trim() || null,
        accountEnabled: input.accountEnabled,
        balance: new Prisma.Decimal(
          input.accountEnabled ? (input.initialBalance ?? 0) : 0
        ),
        lastVisit: new Date()
      }
    });

    if (input.motorcycles?.length) {
      for (const moto of input.motorcycles) {
        await tx.motorcycle.create({
          data: {
            customerId: customer.id,
            brandModel: moto.brandModel.trim(),
            plate: moto.plate.trim().toUpperCase(),
            year: moto.year ?? null,
            notes: moto.notes?.trim() || null
          }
        });
      }
    }

    return customer;
  });

  return mapCustomer(row);
}

export async function addMotorcycle(
  input: CreateMotorcycleWithCustomerInput
): Promise<Motorcycle | null> {
  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer) return null;

  const row = await prisma.motorcycle.create({
    data: {
      customerId: input.customerId,
      brandModel: input.brandModel.trim(),
      plate: input.plate.trim().toUpperCase(),
      year: input.year ?? null,
      notes: input.notes?.trim() || null
    }
  });

  return mapMotorcycle(row);
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<Customer | null> {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.customer.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      phone: input.phone?.trim(),
      email: input.email !== undefined ? input.email.trim() || null : undefined,
      notes: input.notes?.trim(),
      accountEnabled: input.accountEnabled,
      balance: input.balance !== undefined ? new Prisma.Decimal(input.balance) : undefined
    }
  });

  return mapCustomer(row);
}

export async function createWorkOrder(
  input: CreateWorkOrderInput & { createdById?: string; status?: WorkOrderStatus }
): Promise<WorkOrder> {
  const status = (input.status ?? "En espera") as WorkOrderStatus;

  const row = await prisma.$transaction(async (tx) => {
    const order = await tx.workOrder.create({
      data: {
        customerId: input.customerId,
        motorcycleId: input.motorcycleId || null,
        problem: input.problem.trim(),
        observations: input.observations?.trim() || null,
        status: WORK_ORDER_STATUS_TO_DB[status],
        mechanic: input.mechanic,
        createdById: input.createdById ?? null
      },
      include: { parts: true }
    });

    await tx.customer.update({
      where: { id: input.customerId },
      data: { lastVisit: new Date() }
    });

    return order;
  });

  return mapWorkOrder(row);
}

export async function updateWorkOrder(
  id: string,
  input: UpdateWorkOrderInput
): Promise<WorkOrder | null> {
  const existing = await prisma.workOrder.findUnique({
    where: { id },
    include: { parts: { orderBy: { addedAt: "asc" } } }
  });

  if (!existing) return null;

  const row = await prisma.workOrder.update({
    where: { id },
    data: {
      problem: input.problem?.trim(),
      observations: input.observations?.trim(),
      mechanic: input.mechanic,
      status: input.status ? WORK_ORDER_STATUS_TO_DB[input.status] : undefined,
      laborCost:
        input.laborCost !== undefined ? new Prisma.Decimal(input.laborCost) : undefined
    },
    include: { parts: { orderBy: { addedAt: "asc" } } }
  });

  return mapWorkOrder(row);
}

function resolvePartInput(
  input: AddWorkOrderPartInput | AddWorkOrderPartPayload,
  product: { name: string; internalCode: string; publicPrice: { toNumber(): number } }
): AddWorkOrderPartInput {
  if ("productName" in input && "unitPrice" in input) {
    return input;
  }

  return {
    productId: input.productId,
    quantity: input.quantity,
    productName: product.name,
    internalCode: product.internalCode,
    unitPrice: product.publicPrice.toNumber()
  };
}

export async function addWorkOrderPart(
  orderId: string,
  input: AddWorkOrderPartInput | AddWorkOrderPartPayload,
  options?: { createdById?: string }
): Promise<CrmOperationResult<WorkOrder>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.workOrder.findUnique({
        where: { id: orderId },
        include: { parts: { orderBy: { addedAt: "asc" } } }
      });

      if (!order) {
        return { ok: false, error: "Orden de trabajo no encontrada." };
      }

      const status = WORK_ORDER_STATUS_FROM_DB[order.status];
      if (!canAddPartsToWorkOrder(status)) {
        return {
          ok: false,
          error: "Los repuestos solo pueden agregarse desde «En reparación» en adelante."
        };
      }

      const product = await tx.product.findFirst({
        where: { id: input.productId, active: true }
      });

      if (!product) {
        return { ok: false, error: "Producto no encontrado en inventario." };
      }

      const partInput = resolvePartInput(input, product);

      const customer = await tx.customer.findUnique({
        where: { id: order.customerId },
        select: { name: true }
      });

      const consumeResult = await consumeStock(tx, partInput.productId, partInput.quantity, {
        type: "uso_taller",
        reference: orderId,
        detail: `Uso en taller — ${orderId}${customer ? ` (${customer.name})` : ""}`,
        workOrderId: orderId,
        createdById: options?.createdById
      });

      if (!consumeResult.ok) {
        return { ok: false, error: consumeResult.error };
      }

      const subtotal = partInput.unitPrice * partInput.quantity;

      await tx.workOrderPart.create({
        data: {
          workOrderId: orderId,
          productId: partInput.productId,
          productName: partInput.productName.trim(),
          internalCode: partInput.internalCode.trim().toUpperCase(),
          quantity: partInput.quantity,
          unitPrice: new Prisma.Decimal(partInput.unitPrice),
          subtotal: new Prisma.Decimal(subtotal)
        }
      });

      const updated = await tx.workOrder.update({
        where: { id: orderId },
        data: { updatedAt: new Date() },
        include: { parts: { orderBy: { addedAt: "asc" } } }
      });

      return { ok: true, data: mapWorkOrder(updated) };
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo agregar el repuesto a la orden.";
    return { ok: false, error: message };
  }
}

export async function adjustCustomerBalance(
  customerId: string,
  delta: number
): Promise<Customer | null> {
  try {
    const row = await prisma.customer.update({
      where: { id: customerId },
      data: { balance: { increment: new Prisma.Decimal(delta) } }
    });

    return mapCustomer(row);
  } catch {
    return null;
  }
}

export async function touchCustomerVisit(customerId: string): Promise<Customer | null> {
  try {
    const row = await prisma.customer.update({
      where: { id: customerId },
      data: { lastVisit: new Date() }
    });

    return mapCustomer(row);
  } catch {
    return null;
  }
}
