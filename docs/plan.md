# Plan de Refactorización — EcoAhorro Bahía

## 1. Análisis Inicial del Proyecto

### 1.1 Stack tecnológico

| Capa        | Tecnología                                    |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 16 (App Router) + React 19            |
| Lenguaje    | TypeScript 5                                  |
| Estilos     | Tailwind CSS 4                                |
| Base de datos | PostgreSQL (Neon) vía Prisma 7              |
| Auth        | Clerk                                         |
| Mapas       | Leaflet + react-leaflet                       |
| Escáner     | @zxing/library                                |
| Monorepo    | `web/` (frontend), `backend/` (scripts), `data-pipeline/` (scraping), `docs/` |

### 1.2 Estructura actual de `web/src/`

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── carrito/
│   │   │   ├── route.ts
│   │   │   └── items/
│   │   │       ├── route.ts
│   │   │       └── [productoId]/route.ts
│   │   ├── productos/
│   │   │   ├── route.ts
│   │   │   └── [ean]/route.ts
│   │   ├── search/route.ts
│   │   └── supermercados/route.ts
│   ├── carrito/page.tsx
│   ├── catalogo/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── escaner/page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── page.tsx
│   ├── producto/[id]/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── sucursales/
│   │   ├── page.tsx
│   │   └── sucursales_*.json (4 archivos)
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── components/
│   ├── carrito/
│   │   ├── CarritoSidebar.tsx
│   │   ├── FiltroSupermercados.tsx
│   │   └── SelectorMaxSupers.tsx
│   ├── AuthCartPrompt.tsx
│   ├── BarcodeScanner.tsx
│   ├── CartIcon.tsx
│   ├── CatalogoClient.tsx
│   ├── CategoryFilter.tsx
│   ├── ClerkUserSync.tsx
│   ├── HomeClient.tsx
│   ├── MapaSucursales.tsx
│   ├── Navbar.tsx
│   ├── PriceFilter.tsx
│   ├── ProductCard.tsx
│   ├── ProductoDetalleClient.tsx
│   └── ProductSkeleton.tsx
├── constants/
│   └── productos.ts              # MOCK no usado en producción
├── context/
│   └── CartContext.tsx            # 245 líneas, mezcla estado + fetch + sync
├── lib/
│   ├── api-error.ts
│   ├── prisma.ts
│   ├── semanticResolver.ts       # Búsqueda fuzzy + sinónimos
│   ├── sinonimos.ts              # Diccionario de sinónimos
│   └── usuarios.ts
├── proxy.ts                      # Middleware (mal ubicado, debería ser middleware.ts)
├── services/
│   ├── db.ts                     # 240 líneas: SQL raw + transformación + caché
│   ├── productoDetalle.ts        # 155 líneas: queries + lógica USD
│   └── productos.ts              # Wrapper fetch + tipos
└── utils/
    └── cartOptimizer.ts          # Algoritmo de optimización multi-super
```

---

## 2. Violaciones Detectadas

### 2.1 SRP — Single Responsibility Principle

| Archivo | Líneas | Problema |
|---------|--------|----------|
| `services/db.ts` | 240 | Mezcla SQL raw (`$queryRawUnsafe`), lógica de búsqueda semántica, transformación de datos (`ProductoTransformado`), agrupación de precios y caché (`unstable_cache`). Hace TODO. |
| `context/CartContext.tsx` | 245 | Mezcla estado local (`useState`), lógica de sincronización con API, persistencia remota (`persistAdd`, `persistQuantity`, `persistRemove`), merge de carritos local+remoto, y lógica de UI. |
| `app/carrito/page.tsx` | 276 | JSX que mezcla fetch de supermercados, estado de filtros, cálculo de optimización, estado de UI (desplegables), y renderizado de toda la página. |
| `app/escaner/page.tsx` | 321 | Lógica del escáner, búsqueda por EAN, manejo de estados (idle/loading/found/notfound/error), visualización de resultados y manejo del carrito en un solo archivo. |
| `components/CatalogoClient.tsx` | 420 | Estado, fetching con AbortController, debounce de búsqueda, URL management, paginación, skeletons y renderizado. |
| `services/productoDetalle.ts` | 155 | Queries Prisma (`findUnique` con includes), lógica de historial con cotización USD (getCotizacion), interpolación de fechas, compresión de datos. |
| `api/productos/[ean]/route.ts` | 207 | CORS headers, transformación de datos (reduce para agrupar precios), manejo de errores y respuestas. |

### 2.2 DRY — Don't Repeat Yourself

**`getOrCreateCarrito()` duplicada 3 veces:**

```typescript
// api/carrito/route.ts:7
async function getOrCreateCarrito(usuarioId: string) {
  return prisma.carrito.upsert({
    where: { usuarioId },
    create: { id: randomUUID(), usuarioId },
    update: {},
  });
}

// api/carrito/items/route.ts:11 — idéntica
async function getOrCreateCarrito(usuarioId: string) { ... }

// api/carrito/items/[productoId]/route.ts:17 — idéntica
async function getOrCreateCarrito(usuarioId: string) { ... }
```

**`apiError()` definida 3 veces:**

```typescript
// lib/api-error.ts:3 — versión oficial
export function apiError(code: string, message: string, details?: string) { ... }

// proxy.ts:18 — redefinida (inline, mismo código)
function apiError(code: string, message: string, status: number, details?: string) { ... }

// api/productos/[ean]/route.ts:10 — otra redefinición
function apiError(code: string, message: string, details?: string) { ... }
```

**`formatearNombreCategoria()` duplicada:**

```typescript
// components/ProductCard.tsx:8
const formatearNombreCategoria = (nombre: string): string => {
  const texto = nombre.replace(/_/g, ' ');
  return texto.replace(/[a-zA-Záéíóúñ]/, letra => letra.toUpperCase());
};

// components/CategoryFilter.tsx:6 — idéntica
const formatearNombreCategoria = (nombre: string): string => { ... };
```

**Tipo `Supermercado` redefinido en 3 archivos:**

```typescript
// carrito/page.tsx:9
type Supermercado = { id: string; nombre: string };

// CarritoSidebar.tsx:9
type Supermercado = { id: string; nombre: string };

// FiltroSupermercados.tsx:2
type Supermercado = { id: string; nombre: string };
```

**Tipo `Precio` redefinido en múltiples archivos:**

```typescript
// CatalogoClient.tsx:9 — type Precio = { super: string; valor: number }
// CartContext.tsx:6 — type PrecioItem = { super: string; valor: number }
// db.ts — inline en ProductoTransformado.precios
// CarritoPage — inline en los maps
```

### 2.3 DIP — Dependency Inversion Principle

- Las **API Routes** (`api/carrito/`, `api/productos/`, etc.) importan y usan `prisma` directamente. No hay una capa de abstracción entre la ruta HTTP y la base de datos.
- `CartContext.tsx` hace `fetch()` directo a las API routes. No hay un cliente HTTP abstraído que pueda ser testeado o reemplazado.
- `CatalogoClient.tsx` hace `fetch()` directo a `/api/productos`. La lógica de construcción de URLs y llamadas HTTP está acoplada al componente.
- Los componentes `ProductCard.tsx` y `ProductoDetalleClient.tsx` acceden directamente a `CartContext` sin una interfaz intermedia.

### 2.4 Law of Demeter (Principio de Menor Conocimiento)

- En `carrito/page.tsx:189-255`, el código accede en cadena a estructuras profundas:

```tsx
item.producto.precios.filter(p => aplicados.includes(p.super))
item.producto.imagen
item.producto.nombre
item.producto.id
item.producto.marca
item.producto.categoria
```

- `CarritoSidebar.tsx` recibe **11 props** individuales (`supermercados`, `seleccionados`, `onFiltroChange`, `maxSupers`, `onMaxSupersChange`, `hayCambios`, `onOptimizar`, `modoMulti`, `resultadoMulti`, `totalesPorSuper`, `supersAbiertos`, `onToggleSuper`). Esto viola cohesión: debería recibir objetos más abstractos.

- `CarritoPage` conoce la estructura interna de `item.producto.precios`, `item.producto`, etc. Si la estructura de `CartItem` cambia, se rompen multiples puntos.

### 2.5 SoC — Separation of Concerns

- Los JSON de sucursales (`sucursales_*.json`) están dentro de `app/sucursales/`, mezclando datos estáticos con código de routing de Next.js.
- `context/CartContext.tsx` mezcla lógica de negocio (sync de carrito, merge) con lógica de UI (React Context, hooks) y comunicación HTTP.
- `constants/productos.ts` contiene mocks que no se usan en producción, violando YAGNI.

### 2.6 Inconsistencias generales

- **Imports**: mezcla de alias `@/` (ej: `@/lib/api-error`) con rutas relativas (ej: `../../../../lib/api-error`, `../../../lib/prisma`, `../lib/prisma`).
- **proxy.ts**: en la raíz de `src/` cuando por convención de Next.js App Router debería ser `src/middleware.ts`.
- **Tipos**: algunos son `interface`, otros `type`, otros `any`. En `ProductCard.tsx` la prop `producto` es `any`.
- **Nombres de archivo**: inconsistencia entre `route.ts` (convención Next.js) y `proxy.ts` (nombre no estándar).

---

## 3. Arquitectura Propuesta

### 3.1 Principio organizador

Arquitectura **feature-based** (basada en dominios de negocio), donde cada feature encapsula todo lo que necesita: tipos, repositorios, servicios, componentes y datos estáticos.

```
src/
├── app/                          # Next.js App Router — solo routing y thin pages
├── features/                     # Dominios de negocio
│   ├── productos/                # Catálogo, búsqueda, detalle, escáner
│   ├── carrito/                  # Carrito, optimización, persistencia
│   ├── supermercados/            # Listado de cadenas
│   ├── sucursales/               # Mapa de sucursales
│   ├── escaner/                  # Búsqueda por código de barras
│   └── auth/                     # Autenticación y sincronización de usuarios
├── shared/                       # Código transversal reutilizable
│   ├── lib/                      # Prisma client, helpers de API
│   ├── components/ui/            # Componentes UI genéricos
│   ├── components/layout/        # Navbar, CartIcon
│   └── utils/                    # Utilidades de formato
├── middleware.ts                 # Protección de rutas y API key interna
└── types/                        # Tipos globales
```

### 3.2 Criterios de ubicación

| Pregunta | Ubicación |
|----------|-----------|
| ¿Lo usa solo 1 feature? | `features/<domain>/components/` |
| ¿Lo usan 2+ features? | `shared/components/ui/` |
| ¿Es parte del layout global? | `shared/components/layout/` |
| ¿Es un page wrapper de Next.js? | `app/` (thin wrapper, solo import + export) |
| ¿Es acceso a datos? | `features/<domain>/repositories/` |
| ¿Es lógica de negocio? | `features/<domain>/services/` |
| ¿Es transformación de datos? | `features/<domain>/mappers/` |

### 3.3 Capas y flujo de datos

```
┌─────────────────────────────────────────────────────────┐
│                     app/ (thin pages)                     │
│   page.tsx → import { Component } from '@/features/...'  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                app/api/ (API Routes)                      │
│   route.ts → import { service } from '@/features/...'    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              features/*/components/ (UI)                  │
│   Component → import { service, context }                │
│             → import { types } from './types'            │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              features/*/services/ (lógica)                │
│   Service → import { repository } from './repositories'  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│            features/*/repositories/ (datos)               │
│   Repository → import { prisma } from '@/shared/lib'     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  shared/lib/ (infraestructura)             │
│                  prisma.ts, api-error.ts                   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Plan de Ejecución Paso a Paso

### [Paso 1] Crear estructura de directorios

```
src/features/productos/components/
src/features/productos/repositories/
src/features/productos/services/
src/features/productos/mappers/
src/features/carrito/components/
src/features/carrito/context/
src/features/carrito/repositories/
src/features/carrito/services/
src/features/supermercados/repositories/
src/features/supermercados/services/
src/features/sucursales/components/
src/features/sucursales/data/
src/features/escaner/components/
src/features/auth/services/
src/features/auth/components/
src/shared/lib/
src/shared/components/ui/
src/shared/components/layout/
src/shared/utils/
types/
```

Comandos:
```bash
mkdir -p src/features/productos/{components,repositories,services,mappers}
mkdir -p src/features/carrito/{components,context,repositories,services}
mkdir -p src/features/supermercados/{repositories,services}
mkdir -p src/features/sucursales/{components,data}
mkdir -p src/features/escaner/components
mkdir -p src/features/auth/{services,components}
mkdir -p src/shared/{lib,components/ui,components/layout,utils}
mkdir -p types
```

---

### [Paso 2] Mover infraestructura compartida

#### 2a. Mover `src/lib/prisma.ts` → `src/shared/lib/prisma.ts`

Archivo actual (`lib/prisma.ts`, 32 líneas): contiene el singleton de PrismaClient con adapter PostgreSQL.

**Acción**: mover tal cual, sin cambios de contenido.
**Actualizar imports** en todos los archivos que lo referencian:
- `services/db.ts` → `import prisma from '../shared/lib/prisma'`
- `services/productoDetalle.ts` → `import prisma from '../shared/lib/prisma'`
- `lib/semanticResolver.ts` → `import { prisma } from '../shared/lib/prisma'`
- `lib/usuarios.ts` → `import { prisma } from '../shared/lib/prisma'`
- `api/carrito/route.ts` → `import { prisma } from '@/shared/lib/prisma'`
- `api/carrito/items/route.ts` → `import { prisma } from '@/shared/lib/prisma'`
- `api/carrito/items/[productoId]/route.ts` → `import { prisma } from '@/shared/lib/prisma'`
- `api/supermercados/route.ts` → `import { prisma } from '@/shared/lib/prisma'`
- `api/productos/[ean]/route.ts` → `import prisma from '@/shared/lib/prisma'`

#### 2b. Mover `src/lib/api-error.ts` → `src/shared/lib/api-error.ts`

Archivo actual (20 líneas): funciones `apiError()` y `apiErrorResponse()`.

**Acción**: mover tal cual.
**Actualizar imports** en los 7 archivos que lo usan.

#### 2c. Mover `src/lib/sinonimos.ts` → `src/features/productos/repositories/sinonimos.ts`

Archivo actual (130 líneas): diccionario de sinónimos para búsqueda semántica.

**Razón**: es un dato estático que solo usa el dominio de productos.

#### 2d. Mover `src/lib/semanticResolver.ts` → `src/features/productos/services/semanticResolver.ts`

Archivo actual (192 líneas): funciones `normalizar()`, `resolverSinonimos()`, `buscarFuzzy()`, `resolverBusqueda()`.

**Razón**: es el servicio de búsqueda semántica del dominio productos.
**Actualizar imports**: `import { prisma } from '@/shared/lib/prisma'`, `import { SINONIMOS } from '../repositories/sinonimos'`.

#### 2e. Mover `src/lib/usuarios.ts` → `src/features/auth/services/usuarioService.ts`

Archivo actual (64 líneas): funciones `upsertUsuarioFromClerk()` y `getCurrentUsuario()`.

**Razón**: pertenece al dominio de autenticación.
**Actualizar imports**: `import { prisma } from '@/shared/lib/prisma'`.

#### 2f. Crear `src/shared/utils/format.ts`

Extraer `formatearNombreCategoria()` que hoy está duplicada en:
- `components/ProductCard.tsx:8-11`
- `components/CategoryFilter.tsx:6-9`

```typescript
export function formatearNombreCategoria(nombre: string): string {
  const texto = nombre.replace(/_/g, ' ');
  return texto.replace(/[a-zA-Záéíóúñ]/, letra => letra.toUpperCase());
}
```

---

### [Paso 3] Centralizar tipos por feature

#### 3a. Crear `src/features/productos/types.ts`

Unificar estos tipos que hoy están dispersos:

```typescript
// ============================================================
// ORIGEN: services/productos.ts
// ============================================================
export type Supermercado = {
  idSucursal: number;
  nombre: string;
  ubicacionMaps: string;
};

export type PrecioSucursal = {
  sucursal: Supermercado;
  precio: number;
};

export type PreciosPorSuper = {
  supermercado: string;
  precios: PrecioSucursal[];
};

export type HistorialPrecio = {
  fecha: string;
  precioPromedio: number;
};

export type ProductoDetalle = {
  ean: string;
  categoria: string;
  nombreProducto: string;
  marca: string;
  imagen?: string;
  preciosPorSuper: PreciosPorSuper[];
  historialPrecios: HistorialPrecio[];
};

// ============================================================
// ORIGEN: services/db.ts
// ============================================================
export type PrecioResumen = {
  super: string;
  valor: number;
};

export type ProductoCatalogo = {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  imagen: string;
  precios: PrecioResumen[];
};

export type CatalogoResponse = {
  productos: ProductoCatalogo[];
  totalPages: number;
  totalProductos: number;
};

export type RawProductoRow = {
  id: string;
  nombreProducto: string;
  marca: string;
  imagen: string | null;
  categoriaNombre: string | null;
  precioValor: number | null;
  supermercadoNombre: string | null;
  total_count: bigint | number;
};

// ============================================================
// ORIGEN: semanticResolver.ts
// ============================================================
export interface PrecioSupermercado {
  supermercado: string;
  precio: number;
  actualizacion: Date;
}

export interface ProductoResuelto {
  id: string;
  nombreProducto: string;
  marca: string;
  presentacion: string;
  imagen: string | null;
  relevancia: string;
  precios: PrecioSupermercado[];
  mejorPrecio: PrecioSupermercado | null;
}

export interface ProductoFuzzyRaw {
  id: string;
  nombreProducto: string;
  marca: string;
  presentacion: string;
  imagen: string | null;
  score: number;
}

// ============================================================
// ORIGEN: services/productoDetalle.ts
// ============================================================
export type HistorialEntry = {
  fecha: string;
  precioPromedio: number;
  precioUSD?: number;
  esReal: boolean;
};

export type ProductoDetalleData = {
  ean: string;
  nombre: string;
  marca: string;
  presentacion: string;
  categoria: string;
  imagen: string | null;
  preciosPorSuper: {
    supermercado: string;
    precio: number;
  }[];
  historialPrecios: HistorialEntry[];
  precioMinimo: number;
  supermercadoMinimo: string;
};
```

#### 3b. Crear `src/features/carrito/types.ts`

```typescript
// ============================================================
// ORIGEN: context/CartContext.tsx
// ============================================================
export type PrecioItem = {
  super: string;
  valor: number;
};

export type Producto = {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  imagen?: string;
  precios: PrecioItem[];
};

export type CartItem = {
  producto: Producto;
  cantidad: number;
};

export type CartContextType = {
  items: CartItem[];
  isLoadingCart: boolean;
  addToCart: (producto: Producto) => void;
  removeFromCart: (id: string) => void;
  updateCantidad: (id: string, cantidad: number) => void;
  totalItems: number;
  clearCart: () => void;
};

// ============================================================
// ORIGEN: utils/cartOptimizer.ts
// ============================================================
export type TotalPorSuper = {
  nombre: string;
  total: number;
};

export type ProductoEnSuper = {
  id: string;
  nombre: string;
  marca: string;
  imagen?: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

export type SupermercadoResultado = {
  nombre: string;
  productos: ProductoEnSuper[];
  subtotal: number;
};

export type ResultadoOptimizacion = {
  supermercados: SupermercadoResultado[];
  totalGeneral: number;
};
```

#### 3c. Crear `src/features/supermercados/types.ts`

```typescript
export type Supermercado = {
  id: string;
  nombre: string;
};
```

#### 3d. Crear `src/features/sucursales/types.ts`

```typescript
export type Sucursal = {
  id: number;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  supermercadoId: number;
};
```

---

### [Paso 4] Refactorizar `features/productos`

#### 4a. Crear `src/features/productos/repositories/productoRepository.ts`

Extraer las queries de `services/db.ts` y `services/productoDetalle.ts`:

```typescript
import prisma from '@/shared/lib/prisma';

// Origen: db.ts — query SQL raw del catálogo
export async function findProductosRaw(
  page: number,
  limit: number,
  categoriaIds: string[],
  fuzzyIds: string[] | null,
  searchString: string,
  sortBy: string | undefined,
  minPrice: number | undefined,
  maxPrice: number | undefined
): Promise<any[]> {
  // ... el SQL raw actual de db.ts (líneas 74-157)
}

// Origen: db.ts
export async function findCategorias() {
  return prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
}

// Origen: db.ts
export async function countSupermercados() {
  return prisma.supermercado.count();
}

// Origen: productoDetalle.ts
export async function findProductoByEan(ean: string) {
  return prisma.producto.findUnique({
    where: { id: ean },
    include: {
      Categoria: true,
      HistorialPrecios: { orderBy: { fechaGuardado: 'asc' } },
      PreciosUnificados: {
        include: { Supermercado: true },
        orderBy: { precio: 'asc' },
      },
    },
  });
}

// Origen: productoDetalle.ts
export async function findAllDolares() {
  return prisma.precioDolar.findMany({ orderBy: { fechaGuardado: 'asc' } });
}
```

#### 4b. Crear `src/features/productos/mappers/productoMapper.ts`

```typescript
import type { RawProductoRow, ProductoCatalogo, ProductoDetalleData } from '../types';

export function toProductoCatalogo(rows: RawProductoRow[]): ProductoCatalogo[] {
  const productosMap = new Map<string, ProductoCatalogo>();
  for (const row of rows) {
    let producto = productosMap.get(row.id);
    if (!producto) {
      producto = {
        id: row.id,
        nombre: row.nombreProducto,
        marca: row.marca,
        categoria: row.categoriaNombre || 'General',
        imagen: row.imagen || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Sin+Imagen',
        precios: [],
      };
      productosMap.set(row.id, producto);
    }
    if (row.precioValor !== null && row.supermercadoNombre !== null) {
      const yaExiste = producto.precios.some(
        p => p.super === row.supermercadoNombre && p.valor === row.precioValor
      );
      if (!yaExiste) {
        producto.precios.push({ super: row.supermercadoNombre, valor: row.precioValor });
      }
    }
  }
  return Array.from(productosMap.values()).map(p => {
    p.precios.sort((a, b) => a.valor - b.valor);
    return p;
  });
}

export function toProductoDetalleData(producto: any, dolares: any[]): ProductoDetalleData | null {
  if (!producto) return null;
  // ... toda la lógica de transformación de productoDetalle.ts (líneas 52-149)
}
```

#### 4c. Crear `src/features/productos/services/catalogoService.ts`

```typescript
import { unstable_cache } from 'next/cache';
import { findProductosRaw, findCategorias as repoFindCategorias, countSupermercados as repoCountSuper } from '../repositories/productoRepository';
import { toProductoCatalogo } from '../mappers/productoMapper';

async function _getProductosCatalogo(
  page = 1, limit = 24, categoriasInput?: string | string[],
  sortBy?: string, minPrice?: number, maxPrice?: number, searchQuery?: string
) {
  // Lógica actual de db.ts _getProductosCatalogo (líneas 25-212)
  // Usa el repository para queries y el mapper para transformar
}

export const getProductosCatalogo = unstable_cache(
  _getProductosCatalogo,
  ['productos-catalogo-v2'],
  { revalidate: 3600, tags: ['productos'] }
);

export const getCategorias = unstable_cache(
  repoFindCategorias,
  ['categorias-query'],
  { revalidate: 86400, tags: ['categorias'] }
);

export const getSupermercadosCount = unstable_cache(
  repoCountSuper,
  ['supermercados-count'],
  { revalidate: 86400, tags: ['supermercados'] }
);
```

#### 4d. Crear `src/features/productos/services/productoDetalleService.ts`

```typescript
import { unstable_cache } from 'next/cache';
import { findProductoByEan, findAllDolares } from '../repositories/productoRepository';
import { toProductoDetalleData } from '../mappers/productoMapper';

async function _getProductoDetalle(ean: string): Promise<ProductoDetalleData | null> {
  const [producto, dolares] = await Promise.all([
    findProductoByEan(ean),
    findAllDolares(),
  ]);
  return toProductoDetalleData(producto, dolares);
}

export const getProductoDetalle = unstable_cache(
  _getProductoDetalle,
  ['producto-detalle'],
  { revalidate: 3600, tags: ['productos'] }
);
```

#### 4e. Crear `src/features/productos/services/searchService.ts`

Renombrar `resolverBusqueda()` desde `semanticResolver.ts`.

```typescript
import { normalizar, resolverSinonimos, buscarFuzzy } from './semanticResolver';
import prisma from '@/shared/lib/prisma';
import type { ProductoResuelto, PrecioSupermercado } from '../types';

export async function resolverBusqueda(
  query: string,
  umbral: number = 0.20
): Promise<ProductoResuelto[]> {
  // ... lógica actual de resolverBusqueda (líneas 148-192)
}
```

#### 4f. Crear `src/features/productos/services/productoEanService.ts`

Extraer la lógica de transformación de `api/productos/[ean]/route.ts` (líneas 90-152):

```typescript
import prisma from '@/shared/lib/prisma';

export async function getProductoEanResponse(ean: string) {
  const producto = await prisma.producto.findUnique({
    where: { id: ean },
    include: {
      Categoria: true,
      HistorialPrecios: { orderBy: { fechaGuardado: 'asc' } },
      PreciosUnificados: { include: { Supermercado: true }, orderBy: { precio: 'asc' } },
    },
  });

  if (!producto) return null;

  // Agrupar precios por supermercado (reduce)
  const preciosAgrupados = producto.PreciosUnificados.reduce((acc, precio) => {
    const nombreSuper = precio.Supermercado.nombre;
    if (!acc[nombreSuper]) {
      acc[nombreSuper] = { supermercado: nombreSuper, precios: [] };
    }
    acc[nombreSuper].precios.push({
      precio: precio.precio,
      sucursal: {
        idSucursal: Number(precio.id),
        nombre: nombreSuper,
        ubicacionMaps: 'https://maps.google.com',
      },
    });
    return acc;
  }, {} as Record<string, any>);

  return {
    ean: producto.id,
    categoria: producto.Categoria.nombre,
    nombreProducto: producto.nombreProducto,
    marca: producto.marca,
    imagen: producto.imagen ?? undefined,
    historialPrecios: producto.HistorialPrecios.map(h => ({
      fecha: h.fechaGuardado.toISOString(),
      precioPromedio: Number(h.precioPromedio),
    })),
    preciosPorSuper: Object.values(preciosAgrupados),
  };
}
```

#### 4g. Mover componentes visuales de productos

| Origen | Destino | Acciones adicionales |
|--------|---------|---------------------|
| `src/components/HomeClient.tsx` | `features/productos/components/HomeClient.tsx` | Actualizar import de `ProductCard` a `../../shared/components/ui/ProductCard` |
| `src/components/CatalogoClient.tsx` | `features/productos/components/CatalogoClient.tsx` | Actualizar imports: `CategoryFilter` y `PriceFilter` a `./CategoryFilter` y `./PriceFilter`; `ProductCard` a `../../../shared/components/ui/ProductCard`; `ProductSkeleton` a `../../../shared/components/ui/ProductSkeleton` |
| `src/components/ProductoDetalleClient.tsx` | `features/productos/components/ProductoDetalleClient.tsx` | Actualizar import de `CartContext` a `../../carrito/context/CartContext`; import de tipos a `../types` |
| `src/components/CategoryFilter.tsx` | `features/productos/components/CategoryFilter.tsx` | Actualizar import de `format.ts` a `../../../shared/utils/format` |
| `src/components/PriceFilter.tsx` | `features/productos/components/PriceFilter.tsx` | Sin cambios de imports |
| `src/components/BarcodeScanner.tsx` | `features/productos/components/BarcodeScanner.tsx` | Sin cambios |

#### 4h. Archivos a eliminar después de este paso

- `src/services/db.ts` — contenido movido a repository + service
- `src/services/productoDetalle.ts` — contenido movido a repository + service + mapper
- `src/services/productos.ts` — tipos movidos a types.ts, fetch wrapper reemplazado por cartApiClient
- `src/lib/semanticResolver.ts` — movido a features/productos/services/
- `src/lib/sinonimos.ts` — movido a features/productos/repositories/

---

### [Paso 5] Refactorizar `features/carrito`

#### 5a. Crear `src/features/carrito/repositories/carritoRepository.ts`

**Objetivo DRY**: unificar `getOrCreateCarrito()` que hoy está en 3 archivos.

```typescript
import { randomUUID } from 'crypto';
import prisma from '@/shared/lib/prisma';

export async function getOrCreateCarrito(usuarioId: string) {
  return prisma.carrito.upsert({
    where: { usuarioId },
    create: { id: randomUUID(), usuarioId },
    update: {},
  });
}

export async function findCartItems(carritoId: string) {
  return prisma.carritoItem.findMany({
    where: { carritoId },
    include: {
      Producto: {
        include: {
          Categoria: true,
          PreciosUnificados: { include: { Supermercado: true } },
        },
      },
    },
    orderBy: { Producto: { nombreProducto: 'asc' } },
  });
}

export async function upsertCartItem(carritoId: string, productoId: string, cantidad: number) {
  return prisma.carritoItem.upsert({
    where: { carritoId_idProducto: { carritoId, idProducto: productoId } },
    create: { carritoId, idProducto: productoId, cantidad },
    update: { cantidad },
  });
}

export async function deleteCartItem(carritoId: string, productoId: string) {
  return prisma.carritoItem.deleteMany({
    where: { carritoId, idProducto: productoId },
  });
}

export async function clearCartItems(carritoId: string) {
  return prisma.carritoItem.deleteMany({ where: { carritoId } });
}

export async function findProductoById(productoId: string) {
  return prisma.producto.findUnique({ where: { id: productoId }, select: { id: true } });
}
```

#### 5b. Mover `src/utils/cartOptimizer.ts` → `src/features/carrito/services/cartOptimizer.ts`

Sin cambios de contenido, solo actualizar import de `CartItem`:
```typescript
import { CartItem } from '../types';
```

#### 5c. Crear `src/features/carrito/services/cartApiClient.ts`

Extraer los `fetch()` de `CartContext.tsx`:

```typescript
import type { CartItem } from '../types';

const API_BASE = '/api/carrito';

export async function fetchCart(): Promise<{ items?: CartItem[] }> {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Error fetching cart');
  return response.json();
}

export async function addItem(productoId: string): Promise<void> {
  await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productoId }),
  });
}

export async function updateItem(productoId: string, cantidad: number): Promise<void> {
  await fetch(`${API_BASE}/items/${encodeURIComponent(productoId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad }),
  });
}

export async function removeItem(productoId: string): Promise<void> {
  await fetch(`${API_BASE}/items/${encodeURIComponent(productoId)}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<void> {
  await fetch(API_BASE, { method: 'DELETE' });
}

export async function syncItems(items: CartItem[]): Promise<void> {
  await Promise.all(
    items.map(item =>
      fetch(`${API_BASE}/items/${encodeURIComponent(item.producto.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: item.cantidad }),
      })
    )
  );
}
```

#### 5d. Refactorizar `src/features/carrito/context/CartContext.tsx`

El nuevo CartContext (reducido de 245 a ~120 líneas):

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import type { CartItem, Producto, CartContextType } from '../types';
import * as api from '../services/cartApiClient';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const itemsRef = useRef<CartItem[]>(items);
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => { itemsRef.current = items; }, [items]);

  useEffect(() => {
    // Sincronización con API remota cuando cambia el usuario
    // ... (lógica simplificada usando cartApiClient)
  }, [isLoaded, isSignedIn, user?.id]);

  const addToCart = (producto: Producto) => {
    setItems(prev => {
      const existing = prev.find(i => i.producto.id === producto.id);
      if (existing) {
        return prev.map(i =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
    api.addItem(producto.id);
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.producto.id !== id));
    api.removeItem(id);
  };

  const updateCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) { removeFromCart(id); return; }
    setItems(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad } : i));
    api.updateItem(id, cantidad);
  };

  const clearCart = () => {
    setItems([]);
    api.clearCart();
  };

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, isLoadingCart, addToCart, removeFromCart, updateCantidad, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
```

#### 5e. Mover componentes visuales del carrito

| Origen | Destino | Acciones adicionales |
|--------|---------|---------------------|
| `src/components/carrito/CarritoSidebar.tsx` | `features/carrito/components/CarritoSidebar.tsx` | Actualizar import de `cartOptimizer` a `../services/cartOptimizer`; import de FiltroSupermercados y SelectorMaxSupers a `./FiltroSupermercados` y `./SelectorMaxSupers` |
| `src/components/carrito/FiltroSupermercados.tsx` | `features/carrito/components/FiltroSupermercados.tsx` | Importar tipos de `../types` |
| `src/components/carrito/SelectorMaxSupers.tsx` | `features/carrito/components/SelectorMaxSupers.tsx` | Sin cambios |
| Extraer de `app/carrito/page.tsx` | `features/carrito/components/CarritoPage.tsx` | Mover el componente manteniendo la lógica, actualizar imports |

#### 5f. Archivos a eliminar después de este paso

- `src/utils/cartOptimizer.ts` — movido a features/carrito/services/
- `src/context/CartContext.tsx` — movido a features/carrito/context/
- `src/components/carrito/` — todo movido a features/carrito/components/

---

### [Paso 6] Refactorizar `features/supermercados`

#### 6a. Crear `src/features/supermercados/repositories/supermercadoRepository.ts`

```typescript
import prisma from '@/shared/lib/prisma';

export async function findAll() {
  return prisma.supermercado.findMany({ orderBy: { nombre: 'asc' } });
}
```

#### 6b. Crear `src/features/supermercados/services/supermercadoService.ts`

```typescript
import { findAll } from '../repositories/supermercadoRepository';

export async function getSupermercados() {
  return findAll();
}
```

---

### [Paso 7] Refactorizar `features/auth`

#### 7a. Mover `src/lib/usuarios.ts` → `src/features/auth/services/usuarioService.ts`

Contenido idéntico, solo actualizar import:
```typescript
import type { User } from '@clerk/nextjs/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
```

#### 7b. Mover componentes de auth

| Origen | Destino |
|--------|---------|
| `src/components/ClerkUserSync.tsx` | `features/auth/components/ClerkUserSync.tsx` |
| `src/components/AuthCartPrompt.tsx` | `features/auth/components/AuthCartPrompt.tsx` |

Actualizar imports:
- `ClerkUserSync.tsx`: `import { upsertUsuarioFromClerk } from '../services/usuarioService'`
- `AuthCartPrompt.tsx`: sin cambios de import (solo Clerk)

---

### [Paso 8] Refactorizar `features/sucursales`

#### 8a. Mover JSONs de sucursales

```bash
mv src/app/sucursales/sucursales_banderita.json src/features/sucursales/data/banderita.json
mv src/app/sucursales/sucursales_vea.json src/features/sucursales/data/vea.json
mv src/app/sucursales/sucursales_coope.json src/features/sucursales/data/coope.json
mv src/app/sucursales/sucursales_changoMas.json src/features/sucursales/data/changoMas.json
```

#### 8b. Mover `src/components/MapaSucursales.tsx` → `features/sucursales/components/MapaSucursales.tsx`

Actualizar import de `Sucursal`:
```typescript
import type { Sucursal } from '../types';
```

#### 8c. Crear `src/features/sucursales/components/SucursalesPage.tsx`

Extraer de `app/sucursales/page.tsx`:
```typescript
'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import banderita from '../data/banderita.json';
import vea from '../data/vea.json';
import coope from '../data/coope.json';
import changoMas from '../data/changoMas.json';

const MapaSucursales = dynamic(() => import('./MapaSucursales'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa...</div>
});

export default function SucursalesPage() {
  // ... mismo contenido que app/sucursales/page.tsx
}
```

---

### [Paso 9] Refactorizar `features/escaner`

#### 9a. Crear `src/features/escaner/components/EscanerPage.tsx`

Extraer de `app/escaner/page.tsx` (321 líneas) a un componente dedicado:

```typescript
'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { fetchProductoPorEAN } from '../../productos/services/productoEanService';
// OJO: fetchProductoPorEAN es un fetch client-side, no podemos importar el service de servidor.
// Alternativa: mantener fetchProductoPorEAN como función cliente en features/productos/services/
import { useCart } from '../../carrito/context/CartContext';

const BarcodeScanner = dynamic(() => import('../../productos/components/BarcodeScanner'), { ssr: false });
// ... (resto del contenido de app/escaner/page.tsx)
```

**Nota importante**: `fetchProductoPorEAN()` (hoy en `services/productos.ts`) es una función cliente que hace fetch a `/api/productos/${ean}`. Debería ir a `features/productos/services/productoEanClient.ts`.

```typescript
// features/productos/services/productoEanClient.ts
export async function fetchProductoPorEAN(ean: string): Promise<ProductoDetalle | null> {
  const response = await fetch(`/api/productos/${ean}`, {
    next: { revalidate: 3600 },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Error buscando producto');
  return response.json();
}
```

---

### [Paso 10] Mover shared/components

| Origen | Destino | Acciones adicionales |
|--------|---------|---------------------|
| `src/components/ProductCard.tsx` | `shared/components/ui/ProductCard.tsx` | Actualizar import de `CartContext` a `../../../features/carrito/context/CartContext`; actualizar import de `format` a `../../utils/format` |
| `src/components/ProductSkeleton.tsx` | `shared/components/ui/ProductSkeleton.tsx` | Sin cambios |
| `src/components/Navbar.tsx` | `shared/components/layout/Navbar.tsx` | Sin cambios de imports internos |
| `src/components/CartIcon.tsx` | `shared/components/layout/CartIcon.tsx` | Actualizar import de `CartContext` a `../../features/carrito/context/CartContext` |

---

### [Paso 11] Actualizar app/ pages + layout + middleware + API routes

#### 11a. Pages como thin wrappers

**`app/page.tsx`** — actualizar import de HomeClient y services:
```typescript
import HomeClient from '@/features/productos/components/HomeClient';
import { getProductosCatalogo, getSupermercadosCount } from '@/features/productos/services/catalogoService';

export const revalidate = 3600;

export default async function HomePage() {
  const { productos, totalProductos } = await getProductosCatalogo(1, 10);
  const totalSupermercados = await getSupermercadosCount();
  return <HomeClient productosLocales={productos} totalProductos={totalProductos} totalSupermercados={totalSupermercados} />;
}
```

**`app/catalogo/page.tsx`** — actualizar imports:
```typescript
import CatalogoClient from '@/features/productos/components/CatalogoClient';
import { getProductosCatalogo, getCategorias } from '@/features/productos/services/catalogoService';
```

**`app/producto/[id]/page.tsx`** — actualizar imports:
```typescript
import { getProductoDetalle } from '@/features/productos/services/productoDetalleService';
import ProductoDetalleClient from '@/features/productos/components/ProductoDetalleClient';
```

**`app/carrito/page.tsx`** — thin wrapper:
```typescript
import CarritoPage from '@/features/carrito/components/CarritoPage';
export default CarritoPage;
```

**`app/escaner/page.tsx`** — thin wrapper:
```typescript
import EscanerPage from '@/features/escaner/components/EscanerPage';
export default EscanerPage;
```

**`app/sucursales/page.tsx`** — thin wrapper:
```typescript
import SucursalesPage from '@/features/sucursales/components/SucursalesPage';
export default SucursalesPage;
```

#### 11b. Layout

**`app/layout.tsx`** — actualizar todos los imports:
```typescript
import { CartProvider } from '@/features/carrito/context/CartContext';
import CartIcon from '@/shared/components/layout/CartIcon';
import ClerkUserSync from '@/features/auth/components/ClerkUserSync';
import Navbar from '@/shared/components/layout/Navbar';
```

#### 11c. Middleware

Renombrar `src/proxy.ts` → `src/middleware.ts`:

```bash
mv src/proxy.ts src/middleware.ts
```

El contenido es correcto (ya exporta `clerkMiddleware`), solo el nombre de archivo cambia para seguir la convención de Next.js.

Actualizar imports internos en middleware.ts si es necesario.

#### 11d. API Routes

**`api/productos/route.ts`**:
```typescript
import { getProductosCatalogo } from '@/features/productos/services/catalogoService';
import { apiErrorResponse } from '@/shared/lib/api-error';
```

**`api/productos/[ean]/route.ts`**:
```typescript
import { getProductoEanResponse } from '@/features/productos/services/productoEanService';
import { apiError } from '@/shared/lib/api-error';
```

Eliminar las definiciones duplicadas de `apiError()` y `corsHeaders` (ahora se usa `api-error.ts`).

**`api/search/route.ts`**:
```typescript
import { resolverBusqueda } from '@/features/productos/services/searchService';
import { apiErrorResponse } from '@/shared/lib/api-error';
```

**`api/supermercados/route.ts`**:
```typescript
import { getSupermercados } from '@/features/supermercados/services/supermercadoService';
import { apiErrorResponse } from '@/shared/lib/api-error';
```

**`api/carrito/route.ts`** — actualizar imports:
```typescript
import { apiErrorResponse } from '@/shared/lib/api-error';
import { getOrCreateCarrito, findCartItems, clearCartItems } from '@/features/carrito/repositories/carritoRepository';
import { getCurrentUsuario } from '@/features/auth/services/usuarioService';
```

**`api/carrito/items/route.ts`** — actualizar imports:
```typescript
import { getOrCreateCarrito, upsertCartItem, findProductoById } from '@/features/carrito/repositories/carritoRepository';
import { getCurrentUsuario } from '@/features/auth/services/usuarioService';
```

**`api/carrito/items/[productoId]/route.ts`** — actualizar imports:
```typescript
import { getOrCreateCarrito, upsertCartItem, deleteCartItem, findProductoById } from '@/features/carrito/repositories/carritoRepository';
import { getCurrentUsuario } from '@/features/auth/services/usuarioService';
```

---

### [Paso 12] Limpieza final

#### 12a. Eliminar código muerto

```bash
rm src/constants/productos.ts    # Mock no usado en producción (YAGNI)
```

#### 12b. Eliminar carpetas vacías

```bash
rm -rf src/services/   # Contenido movido a features/
rm -rf src/lib/        # Contenido movido a shared/lib/ y features/
rm -rf src/utils/      # Contenido movido a features/carrito/services/ y shared/utils/
rm -rf src/context/    # Contenido movido a features/carrito/context/
rm -rf src/components/carrito/  # Contenido movido a features/carrito/components/
```

#### 12c. Verificar build

```bash
cd web && npm run build
```

Si hay errores de compilación, corregir imports y volver a intentar.

```bash
npm run lint
```

---

## 5. Resumen de archivos creados

| # | Archivo | Origen |
|---|---------|--------|
| 1 | `features/productos/types.ts` | Nuevo (consolidación) |
| 2 | `features/productos/repositories/productoRepository.ts` | Extraído de services/db.ts + productoDetalle.ts |
| 3 | `features/productos/repositories/sinonimos.ts` | Movido de lib/sinonimos.ts |
| 4 | `features/productos/services/semanticResolver.ts` | Movido de lib/semanticResolver.ts |
| 5 | `features/productos/services/catalogoService.ts` | Extraído de services/db.ts |
| 6 | `features/productos/services/productoDetalleService.ts` | Extraído de services/productoDetalle.ts |
| 7 | `features/productos/services/searchService.ts` | Extraído de semanticResolver.ts |
| 8 | `features/productos/services/productoEanService.ts` | Extraído de api/productos/[ean]/route.ts |
| 9 | `features/productos/services/productoEanClient.ts` | Extraído de services/productos.ts |
| 10 | `features/productos/mappers/productoMapper.ts` | Nuevo |
| 11 | `features/productos/components/HomeClient.tsx` | Movido de components/HomeClient.tsx |
| 12 | `features/productos/components/CatalogoClient.tsx` | Movido de components/CatalogoClient.tsx |
| 13 | `features/productos/components/ProductoDetalleClient.tsx` | Movido de components/ProductoDetalleClient.tsx |
| 14 | `features/productos/components/CategoryFilter.tsx` | Movido de components/CategoryFilter.tsx |
| 15 | `features/productos/components/PriceFilter.tsx` | Movido de components/PriceFilter.tsx |
| 16 | `features/productos/components/BarcodeScanner.tsx` | Movido de components/BarcodeScanner.tsx |
| 17 | `features/carrito/types.ts` | Nuevo (consolidación) |
| 18 | `features/carrito/repositories/carritoRepository.ts` | Nuevo (DRY) |
| 19 | `features/carrito/services/cartOptimizer.ts` | Movido de utils/cartOptimizer.ts |
| 20 | `features/carrito/services/cartApiClient.ts` | Extraído de context/CartContext.tsx |
| 21 | `features/carrito/context/CartContext.tsx` | Movido + refactorizado de context/CartContext.tsx |
| 22 | `features/carrito/components/CarritoPage.tsx` | Extraído de app/carrito/page.tsx |
| 23 | `features/carrito/components/CarritoSidebar.tsx` | Movido de components/carrito/CarritoSidebar.tsx |
| 24 | `features/carrito/components/FiltroSupermercados.tsx` | Movido de components/carrito/FiltroSupermercados.tsx |
| 25 | `features/carrito/components/SelectorMaxSupers.tsx` | Movido de components/carrito/SelectorMaxSupers.tsx |
| 26 | `features/supermercados/types.ts` | Nuevo |
| 27 | `features/supermercados/repositories/supermercadoRepository.ts` | Extraído de api/supermercados/route.ts |
| 28 | `features/supermercados/services/supermercadoService.ts` | Nuevo |
| 29 | `features/auth/services/usuarioService.ts` | Movido de lib/usuarios.ts |
| 30 | `features/auth/components/ClerkUserSync.tsx` | Movido de components/ClerkUserSync.tsx |
| 31 | `features/auth/components/AuthCartPrompt.tsx` | Movido de components/AuthCartPrompt.tsx |
| 32 | `features/sucursales/types.ts` | Nuevo |
| 33 | `features/sucursales/data/banderita.json` | Movido de app/sucursales/sucursales_banderita.json |
| 34 | `features/sucursales/data/vea.json` | Movido de app/sucursales/sucursales_vea.json |
| 35 | `features/sucursales/data/coope.json` | Movido de app/sucursales/sucursales_coope.json |
| 36 | `features/sucursales/data/changoMas.json` | Movido de app/sucursales/sucursales_changoMas.json |
| 37 | `features/sucursales/components/MapaSucursales.tsx` | Movido de components/MapaSucursales.tsx |
| 38 | `features/sucursales/components/SucursalesPage.tsx` | Extraído de app/sucursales/page.tsx |
| 39 | `features/escaner/components/EscanerPage.tsx` | Extraído de app/escaner/page.tsx |
| 40 | `shared/lib/prisma.ts` | Movido de lib/prisma.ts |
| 41 | `shared/lib/api-error.ts` | Movido de lib/api-error.ts |
| 42 | `shared/utils/format.ts` | Nuevo |
| 43 | `shared/components/ui/ProductCard.tsx` | Movido de components/ProductCard.tsx |
| 44 | `shared/components/ui/ProductSkeleton.tsx` | Movido de components/ProductSkeleton.tsx |
| 45 | `shared/components/layout/Navbar.tsx` | Movido de components/Navbar.tsx |
| 46 | `shared/components/layout/CartIcon.tsx` | Movido de components/CartIcon.tsx |
| 47 | `middleware.ts` | Renombrado de proxy.ts |

**Total: 47 archivos creados/movidos, ~12 archivos eliminados.**

---

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Imports rotos después de mover archivos | Verificar con `npm run build` después de cada paso |
| Duplicación temporal durante la migración | Mantener archivos originales hasta que todos los imports estén actualizados |
| Conflictos con git (moves vs copies) | Usar `git mv` para mover archivos, no `cp + rm` |
| Pérdida de historial de archivos | `git mv` preserva el historial; `cp + rm` lo rompe |
