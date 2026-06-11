# Estructuración del Proyecto — EcoAhorro Bahía

## Descripción general

EcoAhorro Bahía es un comparador de precios de supermercados en Bahía Blanca.
Permite buscar productos, comparar precios entre cadenas, escanear códigos de
barras (EAN) y optimizar un carrito de compras sugiriendo la combinación más
barata entre supermercados.

## Stack

| Capa        | Tecnología                                    |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 16 (App Router) + React 19            |
| Lenguaje    | TypeScript 5                                  |
| Estilos     | Tailwind CSS 4                                |
| Base de datos | PostgreSQL (Neon) vía Prisma 7              |
| Auth        | Clerk                                         |
| Mapas       | Leaflet + react-leaflet                       |
| Escáner     | @zxing/library                                |

## Arquitectura

El proyecto sigue una **arquitectura basada en features** (dominios de negocio).
Cada feature encapsula sus propios componentes, servicios, repositorios y tipos.
El código transversal vive en `shared/`.

```
src/
├── app/                        # Next.js App Router — routing y páginas
├── features/                   # Dominios de negocio
│   ├── productos/              # Catálogo, búsqueda, detalle
│   ├── carrito/                # Carrito, optimización, persistencia
│   ├── supermercados/          # Listado de cadenas
│   ├── sucursales/             # Mapa de sucursales
│   ├── escaner/                # Búsqueda por código de barras
│   └── auth/                   # Autenticación y sincronización de usuarios
├── shared/                     # Código transversal reutilizable
│   ├── lib/                    # Prisma client, helpers de API
│   ├── components/ui/          # Componentes UI genéricos (ProductCard, etc.)
│   ├── components/layout/      # Navbar, CartIcon
│   └── utils/                  # Utilidades de formato
└── types/                      # Tipos globales
```

## Features en detalle

### `features/productos/`

Domina todo lo relacionado con el catálogo de productos: listado, detalle,
búsqueda semántica y escaneo de códigos de barras.

| Subcarpeta      | Responsabilidad                                      |
|-----------------|------------------------------------------------------|
| `types.ts`      | Tipos del dominio (ProductoCatalogo, PrecioResumen, etc.) |
| `repositories/` | Queries a la base de datos (SQL raw y Prisma)        |
| `services/`     | Lógica de negocio: catálogo, detalle, búsqueda fuzzy, semántica |
| `mappers/`      | Transformación de datos crudos a tipos de dominio    |
| `components/`   | HomeClient, CatalogoClient, ProductoDetalleClient, filtros, escáner |

**Flujo de datos:**
```
API Route / Page → Service → Repository → Prisma/SQL
                       ↓
                   Mapper → DTO → Component
```

### `features/carrito/`

Gestiona el carrito de compras del usuario, su persistencia remota y la
optimización multi-supermercado.

| Subcarpeta      | Responsabilidad                                      |
|-----------------|------------------------------------------------------|
| `types.ts`      | CartItem, Producto, ResultadoOptimizacion, etc.     |
| `repositories/` | CRUD de carrito en base de datos (1 solo lugar, DRY) |
| `services/`     | Optimizador de carrito (combinatoria multi-super)    |
| `context/`      | React Context para estado global del carrito         |
| `components/`   | CarritoPage, CarritoSidebar, filtros de supermercado |

**Flujo de datos:**
```
Component → Context → cartApiClient (fetch) → API Route → Repository → DB
```

### `features/supermercados/`

| Subcarpeta      | Responsabilidad                                      |
|-----------------|------------------------------------------------------|
| `types.ts`      | Tipo Supermercado (id, nombre)                       |
| `repositories/` | Query de supermercados desde DB                      |
| `services/`     | Servicio con caché para listado                      |

### `features/sucursales/`

| Subcarpeta      | Responsabilidad                                      |
|-----------------|------------------------------------------------------|
| `types.ts`      | Tipo Sucursal (lat, lng, dirección, etc.)            |
| `data/`         | JSONs estáticos con ubicaciones por cadena           |
| `components/`   | MapaSucursales (Leaflet), SucursalesPage             |

### `features/escaner/`

| Subcarpeta      | Responsabilidad                                      |
|-----------------|------------------------------------------------------|
| `components/`   | EscanerPage — orquesta escáner + búsqueda EAN + resultados |

### `features/auth/`

| Subcarpeta      | Responsabilidad                                      |
|-----------------|------------------------------------------------------|
| `services/`     | Sincronización de usuarios Clerk ↔ DB (upsert)       |
| `components/`   | ClerkUserSync, AuthCartPrompt                        |

## Código compartido (`shared/`)

| Ruta                    | Responsabilidad                              |
|-------------------------|----------------------------------------------|
| `lib/prisma.ts`         | Instancia singleton del cliente Prisma       |
| `lib/api-error.ts`      | Helper para respuestas de error estandarizadas |
| `components/ui/`        | ProductCard, ProductSkeleton (reutilizables) |
| `components/layout/`    | Navbar, CartIcon (layout global)             |
| `utils/format.ts`       | formatearNombreCategoria y otras utilidades  |

## Routing (`app/`)

Las páginas en `app/` son **thin wrappers** que solo hacen routing y data fetching
server-side. Toda la lógica vive en `features/`.

| Ruta                    | Feature            | Descripción                    |
|-------------------------|--------------------|--------------------------------|
| `/`                     | productos          | Home con productos destacados  |
| `/catalogo`             | productos          | Catálogo con filtros y paginación |
| `/producto/[id]`        | productos          | Detalle + historial de precios |
| `/carrito`              | carrito            | Carrito con optimización       |
| `/escaner`              | escaner            | Búsqueda por código de barras  |
| `/sucursales`           | sucursales         | Mapa de sucursales             |
| `/sign-in`, `/sign-up`  | auth (Clerk)       | Flujos de autenticación        |

### API Routes

| Ruta                              | Feature         | Métodos         |
|-----------------------------------|-----------------|-----------------|
| `/api/productos`                  | productos       | GET             |
| `/api/productos/[ean]`            | productos       | GET             |
| `/api/search`                     | productos       | GET             |
| `/api/supermercados`              | supermercados   | GET             |
| `/api/carrito`                    | carrito         | GET, DELETE     |
| `/api/carrito/items`              | carrito         | POST            |
| `/api/carrito/items/[productoId]` | carrito         | PATCH, DELETE   |

## Middleware

`src/middleware.ts` protege las rutas de la API con una API key interna
(header `x-internal-api-key`) y las rutas protegidas (`/carrito`, `/api/carrito`)
requieren autenticación vía Clerk.

## Principios de diseño aplicados

| Principio | Aplicación                                         |
|-----------|----------------------------------------------------|
| SRP       | Cada archivo tiene una sola responsabilidad        |
| DIP       | API Routes → Services → Repositories → Prisma      |
| SoC       | Features separan dominio, app/ solo routing        |
| DRY       | Tipos centralizados, repositorios únicos           |
| LoD       | Props cohesivas, DTOs tipados                      |
| KISS      | Sin abstracciones innecesarias                     |
| YAGNI     | Sin código muerto ni features anticipadas          |

## Convenciones

- **Imports**: usar alias `@/` (mapea a `src/`)
- **Nombres de archivos**: camelCase para servicios/repos, PascalCase para componentes
- **Tipos**: cada feature exporta sus tipos desde `types.ts`
- **Componentes compartidos**: si lo usan 2+ features → `shared/components/ui/`
