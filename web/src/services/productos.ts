// ============================================================
// TIPOS
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
// API REAL CON NEXT + PRISMA
// ============================================================

export async function fetchProductoPorEAN(
  ean: string
): Promise<ProductoDetalle | null> {

  const response =
    await fetch(
      `/api/producto/${ean}`,
      {
        cache: 'no-store',
      }
    );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      'Error buscando producto'
    );
  }

  return response.json();
}