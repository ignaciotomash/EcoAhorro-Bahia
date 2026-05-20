import { CartItem } from '../context/CartContext';

export type TotalPorSuper = {
  nombre: string;
  total: number;
};

/**
 * Calcula el costo total del carrito si se comprara todo en un único supermercado.
 * Si un producto no tiene precio en ese super, usa el precio más alto disponible como estimación.
 */
export function calcularTotalSuper(items: CartItem[], superNombre: string): number {
  return items.reduce((total, item) => {
    const precio = item.producto.precios.find(p => p.super === superNombre);
    const val = precio
      ? precio.valor
      : Math.max(...item.producto.precios.map(p => p.valor));
    return total + val * item.cantidad;
  }, 0);
}

/**
 * Dado un conjunto de supermercados seleccionados, devuelve el total del carrito
 * en cada uno, ordenado de menor a mayor.
 */
export function calcularTotalesPorSuper(
  items: CartItem[],
  supermercados: string[]
): TotalPorSuper[] {
  return supermercados
    .map(nombre => ({ nombre, total: calcularTotalSuper(items, nombre) }))
    .sort((a, b) => a.total - b.total);
}