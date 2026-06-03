import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.businessSetting.createMany({
    data: [
      { key: "business_name", value: "AYG Motor Racing", label: "Nombre del negocio" },
      { key: "business_phone", value: "+54 11 5555-0100", label: "Teléfono" },
      { key: "business_address", value: "Av. Corrientes 1234, CABA", label: "Dirección" },
      { key: "default_currency", value: "ARS", label: "Moneda" },
      { key: "tax_rate", value: "21", label: "IVA (%)" }
    ],
    skipDuplicates: true
  });

  const lubricantes = await prisma.category.upsert({
    where: { name: "Lubricantes" },
    update: {},
    create: { name: "Lubricantes", description: "Aceites, filtros y fluidos" }
  });

  const frenos = await prisma.category.upsert({
    where: { name: "Frenos" },
    update: {},
    create: { name: "Frenos", description: "Pastillas, discos y líquido" }
  });

  const aceites4t = await prisma.subcategory.upsert({
    where: { categoryId_name: { categoryId: lubricantes.id, name: "Aceites 4T" } },
    update: {},
    create: {
      categoryId: lubricantes.id,
      name: "Aceites 4T",
      description: "Lubricantes sintéticos y minerales"
    }
  });

  const pastillas = await prisma.subcategory.upsert({
    where: { categoryId_name: { categoryId: frenos.id, name: "Pastillas" } },
    update: {},
    create: {
      categoryId: frenos.id,
      name: "Pastillas",
      description: "Delanteras y traseras"
    }
  });

  const motul = await prisma.supplier.upsert({
    where: { id: "seed-supplier-motul" },
    update: {},
    create: {
      id: "seed-supplier-motul",
      name: "Motul Argentina",
      contact: "Comercial Norte",
      phone: "+54 11 4500-8821",
      email: "ventas@motul.com.ar"
    }
  });

  const brembo = await prisma.supplier.upsert({
    where: { id: "seed-supplier-brembo" },
    update: {},
    create: {
      id: "seed-supplier-brembo",
      name: "Brembo LATAM",
      contact: "Área motos",
      phone: "+54 11 4922-1100",
      email: "motos@brembo.com.ar"
    }
  });

  const aceite = await prisma.product.upsert({
    where: { internalCode: "MOT-5100-4T" },
    update: {},
    create: {
      internalCode: "MOT-5100-4T",
      name: "Aceite Motul 5100 15W50 4T",
      description: "Aceite semisintético 15W50 para motores 4 tiempos.",
      categoryId: lubricantes.id,
      subcategoryId: aceites4t.id,
      supplierId: motul.id,
      imageUrl: "https://images.unsplash.com/photo-1625047509248-ec889cbff124?w=400",
      purchasePrice: new Prisma.Decimal(8500),
      publicPrice: new Prisma.Decimal(12900),
      stock: 24,
      min: 6,
      compatibility: ["MOTOCICLETAS", "CUATRO_TIEMPOS"],
      accent: "#ff0000"
    }
  });

  const pastilla = await prisma.product.upsert({
    where: { internalCode: "BRM-PAD-FR" },
    update: {},
    create: {
      internalCode: "BRM-PAD-FR",
      name: "Pastillas Brembo delanteras",
      description: "Par de pastillas sinterizadas uso calle.",
      categoryId: frenos.id,
      subcategoryId: pastillas.id,
      supplierId: brembo.id,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      purchasePrice: new Prisma.Decimal(18000),
      publicPrice: new Prisma.Decimal(26500),
      stock: 8,
      min: 4,
      compatibility: ["MOTOCICLETAS"],
      accent: "#ffffff"
    }
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: aceite.id,
        type: "CREACION",
        detail: `Alta de producto — ${aceite.name}`,
        reference: aceite.internalCode
      },
      {
        productId: aceite.id,
        type: "INGRESO_PROVEEDOR",
        quantity: 24,
        amount: new Prisma.Decimal(8500 * 24),
        detail: "Stock inicial de 24 unidades",
        supplierId: motul.id
      },
      {
        productId: pastilla.id,
        type: "CREACION",
        detail: `Alta de producto — ${pastilla.name}`,
        reference: pastilla.internalCode
      },
      {
        productId: pastilla.id,
        type: "INGRESO_PROVEEDOR",
        quantity: 8,
        amount: new Prisma.Decimal(18000 * 8),
        detail: "Stock inicial de 8 unidades",
        supplierId: brembo.id
      }
    ],
    skipDuplicates: true
  });

  const existingCustomer = await prisma.customer.findFirst({
    where: { phone: "1155551234" }
  });

  const customer =
    existingCustomer ??
    (await prisma.customer.create({
      data: {
        name: "Lucas Fernández",
        phone: "1155551234",
        email: "lucas@email.com",
        accountEnabled: true,
        balance: new Prisma.Decimal(0),
        lastVisit: new Date()
      }
    }));

  await prisma.motorcycle.upsert({
    where: { plate: "AB123CD" },
    update: {},
    create: {
      customerId: customer.id,
      brandModel: "Honda CB 500F",
      plate: "AB123CD",
      year: 2021
    }
  });

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
