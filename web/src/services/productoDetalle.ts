import prisma from '../lib/prisma';
import { unstable_cache } from 'next/cache';

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
    historialPrecios: {
        fecha: string;
        precioPromedio: number;
        precioUSD?: number;
    }[];
    precioMinimo: number;
    supermercadoMinimo: string;
};

async function _getProductoDetalle(ean: string): Promise<ProductoDetalleData | null> {
    const producto = await prisma.producto.findUnique({
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
    const dolares = await prisma.precioDolar.findMany({
        orderBy: { fechaGuardado: 'asc' },
    });
    const dolarMap = new Map<string, number>(
        dolares.map(d => [d.fechaGuardado.toISOString().split('T')[0], d.precioPromedio])
    );

    if (!producto) return null;
    const preciosPorSuper = producto.PreciosUnificados
        .map(pu => ({
            supermercado: pu.Supermercado.nombre,
            precio: pu.precio,
        }))
        .sort((a, b) => a.precio - b.precio);
    //Agrupa precios por cadena de supermercado. cada item en la estrctura tiene: |Supermercado, precio 
    const precioMinimo = preciosPorSuper[0]?.precio ?? 0;
    const supermercadoMinimo = preciosPorSuper[0]?.supermercado ?? '';


    return {
        ean: producto.id,
        nombre: producto.nombreProducto,
        marca: producto.marca,
        presentacion: producto.presentacion,
        categoria: producto.Categoria.nombre,
        imagen: producto.imagen,
        preciosPorSuper,
        historialPrecios: producto.HistorialPrecios.map(h => {
            const fechaISO = h.fechaGuardado.toISOString().split('T')[0];
            const [yyyy, mm, dd] = fechaISO.split("-");
            const cotizacion = dolarMap.get(fechaISO);
            return {
                fecha: `${dd}/${mm}/${yyyy}`,
                precioPromedio: h.precioPromedio,
                precioUSD: cotizacion ? h.precioPromedio / cotizacion : undefined,
            }

        }),
        precioMinimo: precioMinimo === Infinity ? 0 : precioMinimo,
        supermercadoMinimo,
    };
}

export const getProductoDetalle = unstable_cache(
    _getProductoDetalle,
    ['producto-detalle'],
    { revalidate: 3600, tags: ['productos'] }
);