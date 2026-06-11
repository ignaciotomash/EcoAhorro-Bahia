import prisma from '../shared/lib/prisma';
import { unstable_cache } from 'next/cache';

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
    function getCotizacion(fecha: string): number | undefined {
        for (let i = dolares.length - 1; i >= 0; i--) {
            const dolarDate = dolares[i].fechaGuardado.toISOString().split('T')[0];
            if (dolarDate <= fecha) {
                return dolares[i].precioPromedio;
            }
        }
        return undefined;
    }

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


    const realEntries: HistorialEntry[] = producto.HistorialPrecios.map(h => {
        const fechaISO = h.fechaGuardado.toISOString().split('T')[0];
        const [yyyy, mm, dd] = fechaISO.split("-");
        const cotizacion = getCotizacion(fechaISO);
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
            const cotizacion = getCotizacion(fechaISO);
            historialPrecios.push({
                fecha: fechaFormatted,
                precioPromedio: ultimoPrecioConocido,
                precioUSD: cotizacion ? ultimoPrecioConocido / cotizacion : undefined,
                esReal: false,
            });
        }
    }

    const preciosActuales = producto.PreciosUnificados.map(p => p.precio);
    if (preciosActuales.length > 0) {
        const precioActualPromedio = preciosActuales.reduce((a, b) => a + b, 0) / preciosActuales.length;
        const hoy = new Date();
        const dd = String(hoy.getDate()).padStart(2, '0');
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const yyyy = hoy.getFullYear();
        const hoyStr = `${dd}/${mm}/${yyyy}`;
        const hoyISO = `${yyyy}-${mm}-${dd}`;
        const cotizacion = getCotizacion(hoyISO);

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

export const getProductoDetalle = unstable_cache(
    _getProductoDetalle,
    ['producto-detalle'],
    { revalidate: 3600, tags: ['productos'] }
);