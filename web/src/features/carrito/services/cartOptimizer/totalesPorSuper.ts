import type { CartItem, TotalPorSuper, ProductoFaltante } from '@/features/carrito/types';

/**
 * Calcula el total de comprar todo el carrito en un único supermercado.
 * Los productos no disponibles ahí se estiman al precio máximo entre
 * supers donde sí existen, y quedan listados en `faltantes`.
 */
export function calcularTotalSuper(
  items: CartItem[],
  superNombre: string
): { total: number; faltantes: ProductoFaltante[] } {
  let total = 0;
  const faltantes: ProductoFaltante[] = [];

  items.forEach(item => {
    const precio = item.producto.precios.find(p => p.super === superNombre);
    if (precio) {
      total += precio.valor * item.cantidad;
      return;
    }

    faltantes.push({
      id: item.producto.id,
      nombre: item.producto.nombre,
      imagen: item.producto.imagen,
    });
    total += Math.max(...item.producto.precios.map(p => p.valor)) * item.cantidad;
  });

  return { total, faltantes };
}

type ResultadoTotalesPorSuper = {
  resultados: TotalPorSuper[];
  /** true si soloCompletos estaba activo pero ningún super cubría el 100% del carrito */
  huboFallback: boolean;
};

/**
 * Calcula y ordena los totales de cada supermercado individual.
 *
 * - Sin filtro: ordena por precio (empate -> menos faltantes primero).
 * - Con `soloCompletos`: si hay al menos un super con 0 faltantes, devuelve
 *   solo esos, ordenados por precio. Si NINGUNO cubre el 100%, devuelve
 *   todos ordenados por menos faltantes (empate -> más barato) y marca
 *   `huboFallback = true`, para que la UI pueda avisar al usuario.
 */
export function calcularTotalesPorSuper(
  items: CartItem[],
  supermercados: string[],
  soloCompletos: boolean = false
): ResultadoTotalesPorSuper {
  const resultados = supermercados.map(nombre => {
    const { total, faltantes } = calcularTotalSuper(items, nombre);
    return { nombre, total, faltantes };
  });

  if (!soloCompletos) {
    const porPrecio = [...resultados].sort((a, b) => {
      if (a.total !== b.total) return a.total - b.total;
      return a.faltantes.length - b.faltantes.length;
    });
    return { resultados: porPrecio, huboFallback: false };
  }

  const completos = resultados.filter(r => r.faltantes.length === 0);
  if (completos.length > 0) {
    const ordenados = [...completos].sort((a, b) => a.total - b.total);
    return { resultados: ordenados, huboFallback: false };
  }

  // Nadie cubre el 100%: priorizamos menos faltantes y, en empate, el más barato.
  const porMenosFaltantes = [...resultados].sort((a, b) => {
    if (a.faltantes.length !== b.faltantes.length) return a.faltantes.length - b.faltantes.length;
    return a.total - b.total;
  });
  return { resultados: porMenosFaltantes, huboFallback: true };
}