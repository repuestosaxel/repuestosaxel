import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import {
  mapSale,
  PAYMENT_METHOD_TO_DB,
  SALE_STATUS_TO_DB
} from "@/lib/db/mappers";
import { getSaleItemsSummary, getSaleLineSubtotal } from "@/lib/sales";
import { consumeStock, restoreStock } from "@/lib/services/inventory.service";
import type { CreateSaleInput, Sale, SaleStatus } from "@/types/sales";

export type SaleOperationResult =
  | { ok: true; sale: Sale }
  | { ok: false; error: string };

async function nextSaleReference(tx: Prisma.TransactionClient): Promise<string> {
  const last = await tx.sale.findFirst({
    orderBy: { createdAt: "desc" },
    select: { reference: true }
  });

  const parsed = last?.reference ? Number(last.reference.replace("#V-", "")) : NaN;
  const base = Number.isFinite(parsed) ? parsed : 9017;

  return `#V-${base + 1}`;
}

export async function listSales(): Promise<Sale[]> {
  const rows = await prisma.sale.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return rows.map(mapSale);
}

export async function createSale(
  input: CreateSaleInput & { createdById?: string }
): Promise<SaleOperationResult> {
  if (!input.items.length) {
    return { ok: false, error: "Agregá al menos un producto a la venta." };
  }

  const status = input.status ?? "Pagado";

  if (input.paymentMethod === "Cuenta corriente") {
    if (!input.customerId) {
      return { ok: false, error: "Seleccioná un cliente para venta en cuenta corriente." };
    }

    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId }
    });

    if (!customer) {
      return { ok: false, error: "Cliente no encontrado." };
    }

    if (!customer.accountEnabled) {
      return {
        ok: false,
        error: "El cliente seleccionado no tiene cuenta corriente habilitada."
      };
    }
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const productIds = [...new Set(input.items.map((item) => item.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, active: true }
      });
      const productMap = new Map(products.map((product) => [product.id, product]));

      const lineEntries: {
        productId: string;
        productName: string;
        internalCode: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }[] = [];

      for (const item of input.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Producto no encontrado (${item.productId}).`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock} u.`
          );
        }

        const unitPrice = Number(product.publicPrice);
        lineEntries.push({
          productId: product.id,
          productName: product.name,
          internalCode: product.internalCode,
          quantity: item.quantity,
          unitPrice,
          subtotal: getSaleLineSubtotal(item.quantity, unitPrice)
        });
      }

      const reference = await nextSaleReference(tx);
      const subtotal = lineEntries.reduce((sum, line) => sum + line.subtotal, 0);
      const customer = input.customerId
        ? await tx.customer.findUnique({ where: { id: input.customerId } })
        : null;

      const created = await tx.sale.create({
        data: {
          reference,
          customerId: input.customerId ?? null,
          customerName: customer?.name ?? null,
          subtotal: new Prisma.Decimal(subtotal),
          total: new Prisma.Decimal(subtotal),
          paymentMethod: PAYMENT_METHOD_TO_DB[input.paymentMethod],
          status: SALE_STATUS_TO_DB[status],
          notes: input.notes?.trim() || null,
          createdById: input.createdById ?? null,
          items: {
            create: lineEntries.map((line) => ({
              productId: line.productId,
              productName: line.productName,
              internalCode: line.internalCode,
              quantity: line.quantity,
              unitPrice: new Prisma.Decimal(line.unitPrice),
              subtotal: new Prisma.Decimal(line.subtotal)
            }))
          }
        },
        include: { items: true }
      });

      if (status !== "Cancelado") {
        const summary = getSaleItemsSummary(
          lineEntries.map((line) => ({
            productName: line.productName,
            quantity: line.quantity
          }))
        );

        for (const line of lineEntries) {
          const consumeResult = await consumeStock(tx, line.productId, line.quantity, {
            type: "venta",
            reference,
            detail: `Venta mostrador${customer ? ` — ${customer.name}` : ""} · ${summary}`,
            saleId: created.id,
            createdById: input.createdById
          });

          if (!consumeResult.ok) {
            throw new Error(consumeResult.error);
          }
        }

        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: { lastVisit: new Date() }
          });

          if (input.paymentMethod === "Cuenta corriente" && status === "Pagado") {
            await tx.customer.update({
              where: { id: customer.id },
              data: { balance: { decrement: new Prisma.Decimal(subtotal) } }
            });
          }
        }
      }

      return mapSale(created);
    });

    return { ok: true, sale };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar la venta.";
    return { ok: false, error: message };
  }
}

export async function updateSaleStatus(
  saleId: string,
  nextStatus: SaleStatus
): Promise<SaleOperationResult> {
  const existing = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { items: true }
  });

  if (!existing) {
    return { ok: false, error: "Venta no encontrada." };
  }

  const currentStatus = mapSale(existing).status;

  if (currentStatus === nextStatus) {
    return { ok: true, sale: mapSale(existing) };
  }

  if (currentStatus === "Cancelado") {
    return { ok: false, error: "No se puede modificar una venta cancelada." };
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      if (nextStatus === "Cancelado") {
        for (const item of existing.items) {
          const restoreResult = await restoreStock(tx, item.productId, item.quantity, {
            type: "venta",
            reference: existing.reference,
            detail: `Devolución por cancelación — ${existing.reference}`,
            saleId: existing.id
          });

          if (!restoreResult.ok) {
            throw new Error(restoreResult.error);
          }
        }

        if (
          existing.customerId &&
          existing.paymentMethod === "CUENTA_CORRIENTE" &&
          existing.status === "PAGADO"
        ) {
          await tx.customer.update({
            where: { id: existing.customerId },
            data: { balance: { increment: existing.total } }
          });
        }
      }

      const updated = await tx.sale.update({
        where: { id: saleId },
        data: { status: SALE_STATUS_TO_DB[nextStatus] },
        include: { items: true }
      });

      return mapSale(updated);
    });

    return { ok: true, sale };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el estado de la venta.";
    return { ok: false, error: message };
  }
}
