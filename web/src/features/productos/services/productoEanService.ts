import { unstable_cache } from 'next/cache';
import prisma from '@/shared/lib/prisma';

async function _getProductoEanResponse(ean: string) {
  const producto = await prisma.producto.findUnique({
    where: { id: ean },
    include: {
      Categoria: true,
      HistorialPrecios: { orderBy: { fechaGuardado: 'asc' } },
      PreciosUnificados: { include: { Supermercado: true }, orderBy: { precio: 'asc' } },
    },
  });

  if (!producto) return null;

  const preciosAgrupados = producto.PreciosUnificados.reduce((acc, precio) => {
    const nombreSuper = precio.Supermercado.nombre;
    if (!acc[nombreSuper]) {
      acc[nombreSuper] = { supermercado: nombreSuper, precios: [] as any[] };
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
  }, {} as Record<string, { supermercado: string; precios: { precio: number; sucursal: { idSucursal: number; nombre: string; ubicacionMaps: string } }[] }>);

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

export const getProductoEanResponse = unstable_cache(
  _getProductoEanResponse,
  ['producto-ean'],
  { revalidate: 3600, tags: ['productos'] }
);
