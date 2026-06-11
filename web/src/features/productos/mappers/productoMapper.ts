import type { RawProductoRow, ProductoCatalogo, ProductoDetalleData, HistorialEntry } from '@/features/productos/types';

export function toProductoCatalogo(rows: RawProductoRow[]): {
  productos: ProductoCatalogo[];
  totalProductos: number;
} {
  if (rows.length === 0) {
    return { productos: [], totalProductos: 0 };
  }

  const totalProductos = Number(rows[0].total_count);
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
        producto.precios.push({
          super: row.supermercadoNombre,
          valor: row.precioValor,
        });
      }
    }
  }

  const productos = Array.from(productosMap.values());
  for (const p of productos) {
    p.precios.sort((a, b) => a.valor - b.valor);
  }

  return { productos, totalProductos };
}

function getCotizacion(fecha: string, dolares: { fechaGuardado: Date; precioPromedio: number }[]): number | undefined {
  for (let i = dolares.length - 1; i >= 0; i--) {
    const dolarDate = dolares[i].fechaGuardado.toISOString().split('T')[0];
    if (dolarDate <= fecha) {
      return dolares[i].precioPromedio;
    }
  }
  return undefined;
}

export function toProductoDetalleData(
  producto: any,
  dolares: { fechaGuardado: Date; precioPromedio: number }[]
): ProductoDetalleData | null {
  if (!producto) return null;

  const preciosPorSuper = producto.PreciosUnificados
    .map((pu: any) => ({
      supermercado: pu.Supermercado.nombre,
      precio: pu.precio,
    }))
    .sort((a: any, b: any) => a.precio - b.precio);

  const precioMinimo = preciosPorSuper[0]?.precio ?? 0;
  const supermercadoMinimo = preciosPorSuper[0]?.supermercado ?? '';

  const realEntries: HistorialEntry[] = producto.HistorialPrecios.map((h: any) => {
    const fechaISO = h.fechaGuardado.toISOString().split('T')[0];
    const [yyyy, mm, dd] = fechaISO.split("-");
    const cotizacion = getCotizacion(fechaISO, dolares);
    return {
      fecha: `${dd}/${mm}/${yyyy}`,
      precioPromedio: h.precioPromedio,
      precioUSD: cotizacion ? h.precioPromedio / cotizacion : undefined,
      esReal: true,
    };
  });

  const realMap = new Map<string, HistorialEntry>();
  for (const entry of realEntries) {
    realMap.set(entry.fecha, entry);
  }

  const historialPrecios: HistorialEntry[] = [];
  let ultimoPrecioConocido = 0;

  for (const d of dolares) {
    const fechaISO = d.fechaGuardado.toISOString().split('T')[0];
    const [yyyy, mm, dd] = fechaISO.split("-");
    const fechaFormatted = `${dd}/${mm}/${yyyy}`;

    const realEntry = realMap.get(fechaFormatted);
    if (realEntry) {
      historialPrecios.push(realEntry);
      ultimoPrecioConocido = realEntry.precioPromedio;
    } else if (ultimoPrecioConocido > 0) {
      const cotizacion = getCotizacion(fechaISO, dolares);
      historialPrecios.push({
        fecha: fechaFormatted,
        precioPromedio: ultimoPrecioConocido,
        precioUSD: cotizacion ? ultimoPrecioConocido / cotizacion : undefined,
        esReal: false,
      });
    }
  }

  const preciosActuales = producto.PreciosUnificados.map((p: any) => p.precio);
  if (preciosActuales.length > 0) {
    const precioActualPromedio = preciosActuales.reduce((a: number, b: number) => a + b, 0) / preciosActuales.length;
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const yyyy = hoy.getFullYear();
    const hoyStr = `${dd}/${mm}/${yyyy}`;
    const hoyISO = `${yyyy}-${mm}-${dd}`;
    const cotizacion = getCotizacion(hoyISO, dolares);

    const ultimo = historialPrecios[historialPrecios.length - 1];
    if (ultimo && ultimo.fecha === hoyStr) {
      ultimo.precioPromedio = precioActualPromedio;
      ultimo.precioUSD = cotizacion ? precioActualPromedio / cotizacion : undefined;
      ultimo.esReal = true;
    } else {
      historialPrecios.push({
        fecha: hoyStr,
        precioPromedio: precioActualPromedio,
        precioUSD: cotizacion ? precioActualPromedio / cotizacion : undefined,
        esReal: true,
      });
    }
  }

  const historialCompressed = historialPrecios.filter((entry, i, arr) => {
    if (i === 0 || i === arr.length - 1) return true;
    const prev = arr[i - 1];
    return entry.precioPromedio !== prev.precioPromedio
      || entry.precioUSD !== prev.precioUSD;
  });

  return {
    ean: producto.id,
    nombre: producto.nombreProducto,
    marca: producto.marca,
    presentacion: producto.presentacion,
    categoria: producto.Categoria.nombre,
    imagen: producto.imagen,
    preciosPorSuper,
    historialPrecios: historialCompressed,
    precioMinimo: precioMinimo === Infinity ? 0 : precioMinimo,
    supermercadoMinimo,
  };
}
