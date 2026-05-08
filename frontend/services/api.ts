// ============================================================
// TIPOS — reflejan exactamente tu modelo de datos
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
  supermercado: string; // "Vea" | "ChangoMas" | "LaBanderita" | "LaCoope"
  precios: PrecioSucursal[]; // Vea solo tiene 1 entrada sin sucursal
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
// MOCK DATA — reemplazá fetchProductoPorEAN con tu API real
// ============================================================

const MOCK_DB: Record<string, ProductoDetalle> = {
  '7790895000064': {
    ean: '7790895000064',
    categoria: 'Lácteos',
    nombreProducto: 'Leche Entera 1L',
    marca: 'La Serenísima',
    imagen: 'https://placehold.co/400x400/f3f4f6/6b7280?text=Leche+Entera',
    preciosPorSuper: [
      {
        supermercado: 'Vea',
        precios: [
          { sucursal: { idSucursal: 1, nombre: 'Vea', ubicacionMaps: 'https://maps.google.com' }, precio: 1280 },
        ],
      },
      {
        supermercado: 'ChangoMas',
        precios: [
          { sucursal: { idSucursal: 2, nombre: 'ChangoMas Centro', ubicacionMaps: 'https://maps.google.com' }, precio: 1310 },
          { sucursal: { idSucursal: 3, nombre: 'ChangoMas Norte', ubicacionMaps: 'https://maps.google.com' }, precio: 1295 },
        ],
      },
      {
        supermercado: 'LaBanderita',
        precios: [
          { sucursal: { idSucursal: 4, nombre: 'La Banderita Av. Alem', ubicacionMaps: 'https://maps.google.com' }, precio: 1220 },
        ],
      },
      {
        supermercado: 'LaCoope',
        precios: [
          { sucursal: { idSucursal: 5, nombre: 'La Coope Rivadavia', ubicacionMaps: 'https://maps.google.com' }, precio: 1150 },
          { sucursal: { idSucursal: 6, nombre: 'La Coope Brown', ubicacionMaps: 'https://maps.google.com' }, precio: 1160 },
        ],
      },
    ],
    historialPrecios: [
      { fecha: '2025-01', precioPromedio: 980 },
      { fecha: '2025-02', precioPromedio: 1020 },
      { fecha: '2025-03', precioPromedio: 1080 },
      { fecha: '2025-04', precioPromedio: 1150 },
      { fecha: '2025-05', precioPromedio: 1190 },
    ],
  },
  '7791813420480': {
    ean: '7791813420480',
    categoria: 'Almacén',
    nombreProducto: 'Yerba Mate 1kg',
    marca: 'Playadito',
    imagen: 'https://placehold.co/400x400/f3f4f6/6b7280?text=Yerba+Mate',
    preciosPorSuper: [
      {
        supermercado: 'ChangoMas',
        precios: [
          { sucursal: { idSucursal: 2, nombre: 'ChangoMas Centro', ubicacionMaps: 'https://maps.google.com' }, precio: 3400 },
        ],
      },
      {
        supermercado: 'LaCoope',
        precios: [
          { sucursal: { idSucursal: 5, nombre: 'La Coope Rivadavia', ubicacionMaps: 'https://maps.google.com' }, precio: 3650 },
        ],
      },
      {
        supermercado: 'Vea',
        precios: [
          { sucursal: { idSucursal: 1, nombre: 'Vea', ubicacionMaps: 'https://maps.google.com' }, precio: 3800 },
        ],
      },
    ],
    historialPrecios: [
      { fecha: '2025-01', precioPromedio: 2800 },
      { fecha: '2025-02', precioPromedio: 3000 },
      { fecha: '2025-03', precioPromedio: 3200 },
      { fecha: '2025-04', precioPromedio: 3350 },
      { fecha: '2025-05', precioPromedio: 3500 },
    ],
  },
};

// ============================================================
// FUNCIÓN PRINCIPAL — cambiá esto cuando tengas tu API real:
//
// export async function fetchProductoPorEAN(ean: string): Promise<ProductoDetalle | null> {
//   const res = await fetch(`https://tu-api.com/productos/${ean}`);
//   if (!res.ok) return null;
//   return res.json();
// }
// ============================================================

export async function fetchProductoPorEAN(ean: string): Promise<ProductoDetalle | null> {
  // Simula latencia de red
  await new Promise(r => setTimeout(r, 800));
  return MOCK_DB[ean] ?? null;
}