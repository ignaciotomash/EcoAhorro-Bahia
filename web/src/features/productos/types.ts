// ============================================================
// CATÁLOGO — tipos para listado paginado (db.ts)
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
// BÚSQUEDA — tipos para búsqueda semántica (semanticResolver.ts)
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
// DETALLE — tipos para detalle de producto (productoDetalle.ts)
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

// ============================================================
// EAN — tipos para la API de producto por EAN (productos.ts)
// ============================================================

export type SupermercadoEan = {
  idSucursal: number;
  nombre: string;
  ubicacionMaps: string;
};

export type PrecioSucursal = {
  sucursal: SupermercadoEan;
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

export type ProductoDetalleEan = {
  ean: string;
  categoria: string;
  nombreProducto: string;
  marca: string;
  imagen?: string;
  preciosPorSuper: PreciosPorSuper[];
  historialPrecios: HistorialPrecio[];
};
