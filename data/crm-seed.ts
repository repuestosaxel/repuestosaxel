import type {
  Customer,
  CustomerSale,
  Motorcycle,
  WorkOrder
} from "@/types/crm";

export const seedCustomers: Customer[] = [
  {
    id: "C-101",
    name: "Matías Ferreyra",
    phone: "+54 9 11 5823-4481",
    email: "matias.ferreyra@email.com",
    notes: "Cliente frecuente de lubricantes y filtros.",
    accountEnabled: true,
    balance: 0,
    lastVisit: "16 May 2026",
    createdAt: "2024-03-12"
  },
  {
    id: "C-102",
    name: "Sofía Martínez",
    phone: "+54 9 11 6388-1194",
    email: "sofia.martinez@email.com",
    accountEnabled: true,
    balance: -32000,
    lastVisit: "15 May 2026",
    createdAt: "2024-06-20"
  },
  {
    id: "C-103",
    name: "Lucas Benítez",
    phone: "+54 9 11 4412-9090",
    email: "lucas.benitez@email.com",
    notes: "Prefiere service completo los sábados.",
    accountEnabled: true,
    balance: -94000,
    lastVisit: "14 May 2026",
    createdAt: "2023-11-05"
  },
  {
    id: "C-104",
    name: "Camila Duarte",
    phone: "+54 9 11 7001-2348",
    accountEnabled: false,
    balance: 0,
    lastVisit: "12 May 2026",
    createdAt: "2025-01-18"
  },
  {
    id: "C-105",
    name: "Nicolás Medina",
    phone: "+54 9 11 3399-7712",
    email: "nicolas.medina@email.com",
    notes: "Solo compra repuestos en mostrador. Sin moto registrada.",
    accountEnabled: false,
    balance: 0,
    lastVisit: "15 May 2026",
    createdAt: "2025-09-02"
  },
  {
    id: "C-106",
    name: "Roberto Álvarez",
    phone: "+54 9 11 2200-8899",
    email: "roberto.alvarez@email.com",
    accountEnabled: true,
    balance: 15000,
    lastVisit: "10 May 2026",
    createdAt: "2024-08-30"
  }
];

export const seedMotorcycles: Motorcycle[] = [
  {
    id: "M-201",
    customerId: "C-101",
    brandModel: "Yamaha FZ 2.0",
    plate: "A184KLM",
    year: 2022
  },
  {
    id: "M-202",
    customerId: "C-102",
    brandModel: "Honda Wave 110",
    plate: "A092RTR",
    year: 2020
  },
  {
    id: "M-203",
    customerId: "C-103",
    brandModel: "Bajaj Rouser NS 200",
    plate: "AF214DQ",
    year: 2021
  },
  {
    id: "M-204",
    customerId: "C-104",
    brandModel: "Zanella RX 150",
    plate: "AA918MN",
    year: 2019
  },
  {
    id: "M-205",
    customerId: "C-106",
    brandModel: "Honda CB 190R",
    plate: "AC441FR",
    year: 2023
  },
  {
    id: "M-206",
    customerId: "C-106",
    brandModel: "Yamaha XTZ 125",
    plate: "AD902LP",
    year: 2018,
    notes: "Uso diario laburo"
  }
];

export const seedCustomerSales: CustomerSale[] = [
  {
    id: "CS-1001",
    customerId: "C-101",
    reference: "#V-9018",
    date: "16 May 2026, 11:42",
    amount: 186000,
    method: "Mercado Pago",
    status: "Pagado",
    items: "Motul 5100, filtro, bujía NGK"
  },
  {
    id: "CS-1002",
    customerId: "C-102",
    reference: "#V-9017",
    date: "16 May 2026, 10:18",
    amount: 110000,
    method: "Débito",
    status: "Pagado",
    items: "Casco LS2 FF353"
  },
  {
    id: "CS-1003",
    customerId: "C-103",
    reference: "#V-9016",
    date: "15 May 2026, 18:04",
    amount: 294000,
    method: "Transferencia",
    status: "Pendiente",
    items: "Cubierta Pirelli + colocación"
  },
  {
    id: "CS-1004",
    customerId: "C-105",
    reference: "#V-9015",
    date: "15 May 2026, 16:33",
    amount: 38000,
    method: "Efectivo",
    status: "Cancelado",
    items: "Pastillas Brembo"
  },
  {
    id: "CS-1005",
    customerId: "C-106",
    reference: "#V-9010",
    date: "10 May 2026, 14:20",
    amount: 85000,
    method: "Cuenta corriente",
    status: "Pagado",
    items: "Kit service CB 190R"
  }
];

export const seedWorkOrders: WorkOrder[] = [
  {
    id: "T-310",
    customerId: "C-103",
    motorcycleId: "M-203",
    problem: "Ruido en transmisión y tironeo en baja",
    observations: "Cliente reporta el ruido desde hace 2 semanas. Revisar cadena y piñones.",
    status: "En reparación",
    mechanic: "Ezequiel R.",
    parts: [
      {
        id: "WOP-1001",
        productId: "P-1250",
        productName: "Pastillas de freno Brembo Carbon",
        internalCode: "BRM-CBN-FR",
        quantity: 1,
        unitPrice: 38000,
        subtotal: 38000,
        addedAt: "16 May 2026, 14:00"
      }
    ],
    createdAt: "16 May 2026",
    updatedAt: "16 May 2026, 15:30"
  },
  {
    id: "T-309",
    customerId: "C-102",
    motorcycleId: "M-202",
    problem: "Falla eléctrica intermitente",
    observations: "Luces titilan en ralenti. Pendiente medir regulador.",
    status: "Diagnóstico",
    mechanic: "Nicolás P.",
    parts: [],
    createdAt: "16 May 2026",
    updatedAt: "16 May 2026, 09:15"
  },
  {
    id: "T-308",
    customerId: "C-106",
    motorcycleId: "M-205",
    problem: "Pastillas delanteras desgastadas",
    observations: "Repuestos pedidos al proveedor Brembo.",
    status: "Esperando repuestos",
    mechanic: "Alan G.",
    parts: [
      {
        id: "WOP-1002",
        productId: "P-1250",
        productName: "Pastillas de freno Brembo Carbon",
        internalCode: "BRM-CBN-FR",
        quantity: 2,
        unitPrice: 38000,
        subtotal: 76000,
        addedAt: "15 May 2026, 11:30"
      }
    ],
    createdAt: "14 May 2026",
    updatedAt: "15 May 2026, 11:00"
  },
  {
    id: "T-307",
    customerId: "C-104",
    motorcycleId: "M-204",
    problem: "Service completo + carburación",
    observations: "Prueba de ruta OK. Listo para retiro.",
    status: "Finalizado",
    mechanic: "Alan G.",
    parts: [
      {
        id: "WOP-1003",
        productId: "P-1041",
        productName: "Aceite Motul 5100 15W50 4T",
        internalCode: "MOT-5100-4T",
        quantity: 1,
        unitPrice: 48000,
        subtotal: 48000,
        addedAt: "15 May 2026, 10:00"
      },
      {
        id: "WOP-1004",
        productId: "P-1571",
        productName: "Bujía NGK Iridium CR8EIX",
        internalCode: "NGK-CR8EIX",
        quantity: 1,
        unitPrice: 24500,
        subtotal: 24500,
        addedAt: "15 May 2026, 10:05"
      }
    ],
    laborCost: 35000,
    createdAt: "13 May 2026",
    updatedAt: "15 May 2026, 17:20"
  },
  {
    id: "T-306",
    customerId: "C-101",
    motorcycleId: "M-201",
    problem: "Cambio de aceite programado",
    status: "Entregado",
    mechanic: "Diego L.",
    parts: [
      {
        id: "WOP-1005",
        productId: "P-1041",
        productName: "Aceite Motul 5100 15W50 4T",
        internalCode: "MOT-5100-4T",
        quantity: 1,
        unitPrice: 48000,
        subtotal: 48000,
        addedAt: "02 May 2026, 11:00"
      }
    ],
    laborCost: 18000,
    createdAt: "01 May 2026",
    updatedAt: "02 May 2026, 12:00"
  }
];
