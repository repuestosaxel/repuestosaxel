# AYG Motor Racing — Documentación del MVP (demo comercial)

## 1. Resumen ejecutivo

**AYG Motor Racing** es un MVP de presentación (**demo comercial**) implementado como aplicación web. Consiste en un panel de gestión orientado al negocio de **repuestos, accesorios y taller de motos**, con interfaz ejecutiva tipo “centro de comando”: lectura rápida de KPIs, gráficos y tablas coherentes entre **stock, ventas, clientes, taller y finanzas**.

La versión actual **no incluye persistencia ni autenticación real**. Los datos están **hardcodeados (mock)** en el frontend para mostrar diseño, flujo de navegación y mensaje de valor del producto hacia inversionistas, socios comerciales o usuarios piloto.

- **Nombre del paquete:** `ayg-motor-racing-mvp`
- **Stack tecnológico:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, componentes tipo Radix UI (dialogs, tabs, avatar, progress, etc.).

---

## 2. ¿Para qué tipo de cliente es este sistema?

El producto está pensado principalmente para **negocios del ecosistema de motos** que combinan (o pueden combinar):

| Perfil | Descripción |
|--------|-------------|
| **Repuestotería / casa de repuestos** | Venta al mostrador de lubricantes, cubiertas, frenos, indumentaria, electrónica menor, etc. |
| **Taller mecánico de motos** | Recepción de unidades, diagnóstico, repuestos asociados a la orden, seguimiento por etapas y entrega. |
| **Negocio mixto (mostrador + taller)** | El caso más fuerte para el MVP: el mismo stock alimenta ventas directas y reparaciones; el cliente llega por repuesto o por service. |

**Contexto geográfico/cultural implicit en los mocks:** datos de ejemplo con moneda tipo peso (`$`), teléfonos `+54 9 11 …`, patentes formato argentino, lo que encaja en **Argentina / LATAM** sin ser una restricción técnica.

**No es obligatorio que el cliente sea una gran empresa:** el mensaje visual apunta a un **SMB** (PYME) que necesita orden operativo sin depender solo de Excel, papel o múltiples apps desconectadas.

---

## 3. ¿Qué problema resolvemos? (Solución para el cliente)

### 3.1 Dolor habitual en el segmento

- **Información fragmentada:** el stock está en una hoja, las ventas en otra, el taller en papel o WhatsApp y la caja en el banco/POS sin cruces útiles.
- **Decisiones lentas:** no se ve rápido qué falta comprar, qué está rendiendo en categoría o cuántas motos están “atascadas” en el taller.
- **Cliente recurrente invisible:** datos de moto (modelo/patente), historial de trabajos y deuda dispersos entre who knows.
- **Falta de una “foto única del negocio”:** para el dueño no hay una pantalla donde ver ventas del día vs. mes, reparaciones activas y margen/bruto estimado.

### 3.2 Propuesta de valor del MVP

El MVP comunica una **visión única integrada**:

1. **Control de inventario orientado al quiebre** — ver qué SKU está bien, en mínimos o fuera de stock antes de que se detenga venta o taller.
2. **Lectura comercial del mostrador** — tickets, método de pago, ventas recientes y mix producto vs. taller en gráficas.
3. **CRM ligero de taller** — ficha rápida: contacto, moto, patente, última visita, deuda saliente y últimos trabajos.
4. **Pipeline visual de reparaciones** — estados tipo “espera”, “en reparación”, “lista”; mecánico asignado, barra de avance y etapas.
5. **Finanzas de alto nivel** — ingresos vs. egresos, ganancia bruta aproximada y distribución de medios de pago.

Es decir: **reducimos fricción cognitiva** al concentrar preguntas frecuentes del negocio en paneles coherentes con identidad deportiva (“racing”) y foco en **velocidad de lectura**.

---

## 4. Alcance técnico de esta demo (honestidad del MVP)

Para alinear expectativas con stakeholders:

| Capacidad | Estado en esta versión |
|-----------|-------------------------|
| Login con validación servidor | No — acceso tipo “entrá al dashboard”; credenciales prellenadas como ilustración. |
| Persistencia (DB, ERP, POS real) | No — datos estáticos en `data/mock-data.ts`. |
| CRUD real (productos, clientes, órdenes) | Parcialmente simulado (botones de UI como “Agregar producto” sin efecto sobre datos). |
| Reportes PDF / Excel, permisos, multi-sucursal | Planeado conceptualmente (`SimpleModule`), pantalla placeholder. |

La **landing** `/` redirige a **`/login`**. Desde ahí el usuario navega al **`/dashboard`** sin flujo OAuth ni sesión.

Los textos explícitos en la UI aclaran:

- Login: *“Demo comercial MVP”*, *“Los datos son mockeados…”*.
- Sidebar: *“Datos hardcodeados para presentar flujo, diseño y valor del producto.”*

---

## 5. Arquitectura de la experiencia de usuario

### 5.1 Navegación principal

Shell común por `DashboardClient`:

- **Sidebar** responsive (overlay en mobile, drawer con backdrop; sticky en escritorio).
- **Topbar** con menú hamburguesa para abrir el sidebar en mobile.
- **Contenido** de módulos con **Framer Motion** (`AnimatePresence` + transición fade/slide al cambiar módulo).

### 5.2 Módulos disponibles (`ModuleId`)

Orden como en barra lateral:

1. **Dashboard** — Centro de comando.
2. **Stock** — Inventario visual.
3. **Ventas** — Mostrador premium + histórico.
4. **Clientes** — CRM de taller por tarjetas.
5. **Taller** — Motos en reparación con progreso.
6. **Finanzas** — Resumen ejecutivo económico.
7. **Reportes** — *Placeholder* (roadmap declarado).
8. **Configuración** — *Placeholder* (roadmap declarado).

---

## 6. Funcionalidades por módulo (detalle)

### 6.1 Dashboard — “Performance del negocio en tiempo real”

Propósito: **una sola página** donde el gestor absorbe el pulso diario/semanal/mensual.

**Tarjetas de KPI (`StatCard`):**

- Ventas del día (+ tendencia vs. ayer).
- Ventas del mes (+ tendencia vs. objetivo; % de objetivo cumplido en copy).
- Bajo stock (cantidad total + destacado de críticos / compra urgente).
- Reparaciones activas (total + subtítulo de listas para entregar).
- Clientes nuevos (total + entrada semanal).
- Ganancia mensual (estimación de margen en copy).

**Gráficos (Recharts):**

- **Ventas semanales (área)** — serie `ventas` (repuestos) vs `taller`, por día de la semana. Permite ver **ratio fin de semana**, picos sabatinos típicos de taller, etc.
- **Productos más vendidos (barras horizontales)** — ranking por **unidades** en el período ejemplo.
- **Ingresos mensuales vs egresos (barras agrupadas)** — narrativa de flujo mensual simplificado.

**Otros elementos:**

- **Pie chart:** participación porcentual por categoría de ventas (lubricantes, cubiertas, cascos, etc.).
- **Actividad reciente:** línea de tiempo resumida (ventas, stock crítico, motos listas, cobros pendientes) — muy útil en taller para comunicar urgencias operativas.

### 6.2 Stock — “Stock de repuestos y accesorios”

Propósito: **evitar ruptura de cadena** mostrador ↔ taller **antes** que el problema sea visible solo en falta física.

**Elementos:**

- Barra superior con **buscador** (“nombre, categoría o código”) y botón **Filtros** (UI preparada para futuros filtros reales por categoría, estado, rango de precio, etc.).
- Acción destacada **“Agregar producto”** como ancla de backlog de alta de SKU.
- **Tabla responsive** horizontal scroll en pantallas angostas:

  Por fila/producto mock:

  - Avatar visual tipo tarjeta con gradiente (“racing”).
  - Nombre legible para mostrador **+ código interno** (`P-xxxx`).
  - **Categoría** (ej. lubricantes, cubiertas).
  - **Stock actual vs. mínimo** — críticos para reposición preventiva.
  - **Precio de venta** formateado.
  - **Estado discreto:** `En stock` | `Bajo stock` | `Sin stock` (badges unificadas con otros módulos).

**Historia de uso:** el encargado de compras o el dueño marca en segundos qué SKUs están en rojo antes de hacer el pedido al mayorista.

### 6.3 Ventas — “Ventas rápidas con lectura comercial”

Propósito: **traducir volumen operativo en narrativa POS** útil sin abrir spreadsheets.

**Métricas superiores:**

- Ticket promedio.
- Productos vendidos (unidades período ejemplo).
- Clientes frecuentes (+ indicador cualitativo de recompra tipo “top %”).
- Pagos digitales (% del mix total — señala madurez digital del negocio).

**Tabla “Ventas recientes”:**

- ID de orden (`#V-xxxx`).
- Resumen textual de ítems (simula línea tipo ticket).
- Cliente y fecha (“Hoy/Ayer”).
- Monto monetario + método (**Mercado Pago, efectivo, transferencia** — reflejan realidad LATAM actual).
- **Estado formalizado:** Pagado | Pendiente | Cancelado — permite extender después a workflows de auditoría/factura.

Estado transaccional permite visibilizar **riesgo operativo**: por ejemplo pendientes por confirmación transferencia típico en talleres.

### 6.4 Clientes — “Clientes, motos e historial”

Propósito: **ordenar información relacional cliente ↔ unidad**, crítico en taller y repuestotería donde el vehículo no es opcional metadata.

Tarjetas con:

- Nombre **+ badges** teléfonico / modelo moto (iconografía clara para recepción con manos ocupadas).
- **Deuda** — badge verde (“Sin deuda”) o warning con monto; habilita discusión posterior de cuentas corrientes formales vs. uso simple.
- **Patente domicilio** + **fecha última visita** destacada grid.
- **Tags de últimos trabajos:** historización compacta tipo “timeline reducido” horizontal.

Este módulo responde preguntas: *¿Qué le hice la última vez? ¿Por qué patente viene? ¿Debe algo antes de cargar repuesto nuevo?*

### 6.5 Taller — “Motos en reparación”

Propósito: **digitalizar sobre papel** el orden de trabajo y **previsualizar** seguimiento en columnas/board virtual.

Tarjetas de orden con:

- **ID taller** (`T-xxx`).
- Modelo destacado por encima de todo (lectura rápida en sala de trabajo).
- **Descripción problema** en texto corrido tipo recepción.
- **Cliente, mecánico asignado, fecha ingreso**.
- **Barra de progreso** numérica (%).
- **Stepper conceptual** de proceso: recepción → diagnóstico → repuestos → armado → prueba — cada paso marca activo hasta el % coherente (UX que educa proceso futuro BPM).

Estados ejemplo:

- En espera
- En reparación
- Lista para entregar

Coherencia con Dashboard: KPI de reparaciones activas y líneas de actividad.

### 6.6 Finanzas — “Ingresos, egresos y rentabilidad”

Propósito: **capa ejecutiva económica** sin contabilidad profesional desde día uno (mensaje producto: “insight suficiente para decidir hoy”; el detalle IVA/importaciones lo vería un rollout mayor).

Tarjetas:

- Ingresos mensuales
- Egresos (presentado incluso como “optimizado” en copia ejemplo — narrativa storytelling B2B)
- Ganancia bruto sugerido
- **Gastos taller como % del egreso** — conecta operación física del taller con resultado monetario global.

Charts / listados:

- Reutiliza **`monthlyIncome`** ingresos/egresos en barras.
- **Lista de métodos de pago** porcentual **+ barrita de progreso** + íconos (tarjeta efectivo transferencia Mercado Pago etc.) para ver **preferencia cliente** sin descargos bancarios aún integrados.

### 6.7 Reportes (placeholder explícito)

Texto producto menciona backlog:

- Informes exportables
- Rankings extendidos y márgenes por categoría
- Proyección de compras
- Comparativas temporales mayor granularidad que dashboard

UI: `EmptyState` con llamada tipo “Diseñar reporte”. **Valor actual:** establecer roadmap y no frenar lanzamiento MVP visual.

### 6.8 Configuración (placeholder explícito)

Backlog conceptual declarado:

- Usuarios y permisos
- Multi-sucursal
- Parámetros fiscales/impuestos
- Hardware (impresoras tickets)
- Reglas comerciales (descuentos, listas precio futuras)

Valor: **mensaje modular** (“crecemos hasta ERP”) sin exponer seguridad incompleta ahora mismo.

---

## 7. Identidad visual y línea de marca

Naming y copy en login / hero:

> “Control total. Ritmo de pista.”

Descripción recurrente:

> Stock, ventas, clientes, taller y finanzas en interfaz pensada para decidir rápido.

Elementos típicos:

- **Dark racing theme** (`globals.css` define paleta deportiva tipo rojo alto contraste sobre negro/graphite carbon).
- **Tipografía principal:** Poppins (Google Font) cargada desde `layout.tsx` con clase `dark` en `<html>` — estética continua día/noche enfocada a panel interno tipo “ comando nocturno”.
- Animaciones sutiles mejoran sensación premium sin frenar KPIs densos.

Esto comunica profesionalización del negocio (no “ERP gris anos 90”) importante para demos comerciales B2B en retail motorizado.

---

## 8. Qué se espera de este sistema según esta etapa MVP

Expectativas **correctas** (alineadas código actual):

| Expectativa válida | Explicación |
|--------------------|------------|
| Vender historia de producto y UX | Se ve el flujo, la jerarquía visual y coherencia de datos entre módulos. |
| Probar narrativa ante dueños de taller/repuesto | KPIs están en lenguaje del negocio, no jargon IT. |
| Definir prioridades siguiente iteración | Qué tabla profundiza, qué grafico evoluciona primero (ej. taller → órdenes reales DB). |

Expectativas **incorrectas** (riesgo si nadie comunica alcance demo):

| Riesgo | Realidad técnica |
|--------|------------------|
| “Ya podemos cargar datos reales hoy mismo” | Requiere API + modelo + seguridad fuera alcance archivo mock. |
| “Multiusuario con auditoría lista” | No hay auth ni registros immutable. |
| “Reporteo fiscal automatizado desde stock” | No hay motor contable enlazado. |

El MVP debe posicionarse como **hipótesis de interfaz integral** + roadmap claro cuando se agrega backend.

---

## 9. Próximo salto técnico (no implementado pero implícito en copy)

Sin inventar backlog no mencionado, lo que la propia interfaz ya sugiere como evoluciones naturales:

1. **Persistencia** y API (REST/tRPC/etc.) detrás Next.js Route Handlers o servicios separados.
2. **Identity & roles:** recepción, mecánico, supervisión financiera dueño vs. sólo vista operativa limitada — como anticipa configuración futura.
3. **Órdenes de taller enlazadas a consumo inventario:** restar SKU al cerrar trabajo.
4. **Facturación / CAE electrónico (AR)** cuando el mercado cliente lo exija.
5. **Export CSV/Excel** reportes rápidos low-tech antes PDF complejos.
6. **Webhooks/notificaciones** stock críticos (email/WhatsApp business) usando eventos servidor.

Este orden aparece porque los datos mocks ya relacionan causas efectos (ej. ruptura inventario aparece también en línea tiempo actividad).

---

## 10. Cómo correr localmente el MVP (developers)

(Requiere Node.js compatible.)

```bash
pnpm install # o npm install / yarn según preferencia equipo
pnpm dev      # servidor Next desarrollo típico :3000 (ver mensaje CLI)
pnpm build && pnpm start # producción local empaquetado
```

Navegar `http://localhost:3000` → `/login` → botón entrada dashboard.

*(No reproducimos aquí detalles de variables entorno porque el MVP actual no fuerza configuración servidor externa visible en código público revisado para este doc.)*

---

## 11. Conclusión

**AYG Motor Racing MVP** muestra cómo una **PYME motorizada** puede evolucionar hacia una **suite operativo-comercial-financiera liviana**. Hoy sirve sobre todo para:

- Democratizar una **historia única**: “Ya no trabajo con cinco lugares diferentes para saber cómo anda el negocio.”
- Probar adopción de conceptos antes de financiar infraestructura grande.
- Alinear equipo producto/marketing/sobre desarrollo usando **interfaces concretas** en lugar decks abstractos.

Los datos están mockeados **a propósito** para enfocarse en velocidad comunicacional; el código modular (`modules/` + `data/mock-data.ts`) permite reemplazar mock por llamadas asíncronas sin reescritura grande de vistas.

---

*Documentación generada a partir del análisis del repositorio (App Router Next.js, mock data centralizado, copy UI en español).*  
*Nombre comercial utilizado en la experiencia del producto / marketing: **AYG Motor Racing**.*
