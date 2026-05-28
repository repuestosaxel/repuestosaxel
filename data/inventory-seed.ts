import type {
  Category,
  Product,
  ProductHistoryEntry,
  Subcategory,
  Supplier
} from "@/types/inventory";

export const seedCategories: Category[] = [
  { id: "CAT-1", name: "Lubricantes", description: "Aceites, filtros y fluidos" },
  { id: "CAT-2", name: "Cascos", description: "Indumentaria y protección" },
  { id: "CAT-3", name: "Frenos", description: "Pastillas, discos y líquido" },
  { id: "CAT-4", name: "Cubiertas", description: "Neumáticos y cámaras" },
  { id: "CAT-5", name: "Transmisión", description: "Cadena, piñones y kits" },
  { id: "CAT-6", name: "Encendido", description: "Bujías, bobinas y cables" }
];

export const seedSubcategories: Subcategory[] = [
  { id: "SUB-1", categoryId: "CAT-1", name: "Aceites 4T", description: "Lubricantes sintéticos y minerales" },
  { id: "SUB-2", categoryId: "CAT-1", name: "Filtros", description: "Aceite y aire" },
  { id: "SUB-3", categoryId: "CAT-2", name: "Integrales", description: "Cascos cerrados" },
  { id: "SUB-4", categoryId: "CAT-3", name: "Pastillas", description: "Delanteras y traseras" },
  { id: "SUB-5", categoryId: "CAT-4", name: "Deportivas", description: "Uso calle y pista" },
  { id: "SUB-6", categoryId: "CAT-5", name: "Kits completos", description: "Cadena + piñones" },
  { id: "SUB-7", categoryId: "CAT-6", name: "Bujías", description: "NGK, Denso y similares" }
];

export const seedSuppliers: Supplier[] = [
  {
    id: "SUP-1",
    name: "Motul Argentina",
    contact: "Comercial Norte",
    phone: "+54 11 4500-8821",
    email: "ventas@motul.com.ar"
  },
  {
    id: "SUP-2",
    name: "LS2 Distribuidora",
    contact: "Mariana Ruiz",
    phone: "+54 11 4788-2200",
    email: "pedidos@ls2.com.ar"
  },
  {
    id: "SUP-3",
    name: "Brembo LATAM",
    contact: "Área motos",
    phone: "+54 11 4922-1100",
    email: "motos@brembo.com"
  },
  {
    id: "SUP-4",
    name: "Pirelli Moto",
    contact: "Mayorista CABA",
    phone: "+54 11 5200-4411",
    email: "moto@pirelli.com.ar"
  },
  {
    id: "SUP-5",
    name: "Riffel Repuestos",
    contact: "Depósito central",
    phone: "+54 11 4300-9900",
    email: "ventas@riffel.com.ar"
  },
  {
    id: "SUP-6",
    name: "NGK Spark Plugs",
    contact: "Distribución sur",
    phone: "+54 11 4600-3300",
    email: "info@ngk.com.ar"
  }
];

export const seedProducts: Product[] = [
  {
    id: "P-1041",
    internalCode: "MOT-5100-4T",
    name: "Aceite Motul 5100 15W50 4T",
    description: "Aceite semisintético 15W50 para motores 4 tiempos. Ideal para uso diario y service programado.",
    categoryId: "CAT-1",
    subcategoryId: "SUB-1",
    supplierId: "SUP-1",
    imageUrl: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=600&q=80",
    purchasePrice: 32000,
    publicPrice: 48000,
    stock: 40,
    min: 12,
    compatibility: ["Motocicletas", "4 tiempos"],
    accent: "from-red-600 to-zinc-900"
  },
  {
    id: "P-1188",
    internalCode: "LS2-FF353-RK",
    name: "Casco LS2 FF353 Rookie",
    description: "Casco integral homologado con visor anti-rayas y sistema de ventilación multipunto.",
    categoryId: "CAT-2",
    subcategoryId: "SUB-3",
    supplierId: "SUP-2",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
    purchasePrice: 78000,
    publicPrice: 110000,
    stock: 7,
    min: 6,
    compatibility: ["Motocicletas"],
    accent: "from-white/70 to-red-700"
  },
  {
    id: "P-1250",
    internalCode: "BRM-CBN-FR",
    name: "Pastillas de freno Brembo Carbon",
    description: "Pastillas delanteras de alto rendimiento con compuesto carbono-cerámico para frenado progresivo.",
    categoryId: "CAT-3",
    subcategoryId: "SUB-4",
    supplierId: "SUP-3",
    imageUrl: "https://images.unsplash.com/photo-1558980664-769d93846b3d?auto=format&fit=crop&w=600&q=80",
    purchasePrice: 24500,
    publicPrice: 38000,
    stock: 16,
    min: 10,
    compatibility: ["Motocicletas"],
    accent: "from-red-700 to-neutral-800"
  },
  {
    id: "P-1324",
    internalCode: "PIR-DRL-II-120",
    name: "Cubierta Pirelli Diablo Rosso II",
    description: "Neumático deportivo 120/70 para uso mixto calle y pista con excelente agarre en curva.",
    categoryId: "CAT-4",
    subcategoryId: "SUB-5",
    supplierId: "SUP-4",
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
    purchasePrice: 82000,
    publicPrice: 116000,
    stock: 3,
    min: 5,
    compatibility: ["Motocicletas"],
    accent: "from-zinc-700 to-red-800"
  },
  {
    id: "P-1428",
    internalCode: "RIF-KIT-CG150",
    name: "Kit transmisión Riffel CG 150",
    description: "Kit completo cadena, corona y piñón para Honda CG 150 y compatibles.",
    categoryId: "CAT-5",
    subcategoryId: "SUB-6",
    supplierId: "SUP-5",
    imageUrl: "https://images.unsplash.com/photo-1568778551069-4e4c8d4c4b4b?auto=format&fit=crop&w=600&q=80",
    purchasePrice: 76000,
    publicPrice: 111000,
    stock: 0,
    min: 4,
    compatibility: ["Motocicletas", "4 tiempos"],
    accent: "from-neutral-700 to-neutral-950"
  },
  {
    id: "P-1571",
    internalCode: "NGK-CR8EIX",
    name: "Bujía NGK Iridium CR8EIX",
    description: "Bujía de iridio de larga duración para motores 4T de alto rendimiento.",
    categoryId: "CAT-6",
    subcategoryId: "SUB-7",
    supplierId: "SUP-6",
    imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80",
    purchasePrice: 15800,
    publicPrice: 24500,
    stock: 23,
    min: 8,
    compatibility: ["Motocicletas", "4 tiempos"],
    accent: "from-red-500 to-neutral-900"
  }
];

export const seedProductHistory: ProductHistoryEntry[] = [
  {
    id: "H-1001",
    productId: "P-1041",
    type: "ingreso_proveedor",
    date: "12 May 2026, 09:30",
    detail: "Recepción de 24 unidades desde Motul Argentina",
    quantity: 24,
    amount: 768000,
    supplierId: "SUP-1",
    reference: "OC-2026-0412"
  },
  {
    id: "H-1002",
    productId: "P-1041",
    type: "venta",
    date: "16 May 2026, 11:42",
    detail: "Venta mostrador — Matías Ferreyra",
    quantity: 1,
    amount: 48000,
    reference: "#V-9018"
  },
  {
    id: "H-1003",
    productId: "P-1041",
    type: "uso_taller",
    date: "15 May 2026, 16:10",
    detail: "Service completo — Honda Wave 110 (Sofía Martínez)",
    quantity: 1,
    reference: "T-309"
  },
  {
    id: "H-1004",
    productId: "P-1250",
    type: "ingreso_proveedor",
    date: "10 May 2026, 14:00",
    detail: "Reposición de pastillas Brembo — lote nuevo",
    quantity: 12,
    amount: 294000,
    supplierId: "SUP-3",
    reference: "OC-2026-0398"
  },
  {
    id: "H-1005",
    productId: "P-1250",
    type: "venta",
    date: "14 May 2026, 10:05",
    detail: "Venta mostrador — cliente walk-in",
    quantity: 2,
    amount: 76000,
    reference: "#V-9012"
  },
  {
    id: "H-1006",
    productId: "P-1428",
    type: "uso_taller",
    date: "14 May 2026, 17:45",
    detail: "Instalación en Bajaj Rouser NS 200 — Lucas Benítez",
    quantity: 1,
    reference: "T-310"
  },
  {
    id: "H-1007",
    productId: "P-1428",
    type: "ajuste_stock",
    date: "16 May 2026, 08:15",
    detail: "Ajuste por rotura de stock — última unidad consumida",
    quantity: -1
  },
  {
    id: "H-1008",
    productId: "P-1188",
    type: "venta",
    date: "16 May 2026, 10:18",
    detail: "Venta mostrador — Sofía Martínez",
    quantity: 1,
    amount: 110000,
    reference: "#V-9017"
  },
  {
    id: "H-1009",
    productId: "P-1324",
    type: "ingreso_proveedor",
    date: "08 May 2026, 11:20",
    detail: "Ingreso de cubiertas Pirelli — pedido mensual",
    quantity: 6,
    amount: 492000,
    supplierId: "SUP-4",
    reference: "OC-2026-0381"
  },
  {
    id: "H-1010",
    productId: "P-1571",
    type: "ingreso_proveedor",
    date: "05 May 2026, 10:00",
    detail: "Reposición bujías NGK desde distribuidor sur",
    quantity: 30,
    amount: 474000,
    supplierId: "SUP-6",
    reference: "OC-2026-0365"
  }
];
