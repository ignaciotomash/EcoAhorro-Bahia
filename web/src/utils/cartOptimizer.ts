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

// ── Tipos para optimización multi-supermercado ─────────────

export type ProductoEnSuper = {
  id: string;
  nombre: string;
  marca: string;
  imagen?: string;
  cantidad: number;
  precio: number;      // precio unitario
  subtotal: number;
};

export type SupermercadoResultado = {
  nombre: string;
  productos: ProductoEnSuper[];
  subtotal: number;
};

export type ResultadoOptimizacion = {
  supermercados: SupermercadoResultado[];
  totalGeneral: number;
};

// ── Helpers ────────────────────────────────────────────────

/**
 * Genera todas las combinaciones de tamaño k de un array.
 * Ej: combinaciones(['A','B','C'], 2) → [['A','B'], ['A','C'], ['B','C']]
 */
function combinaciones<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [primero, ...resto] = arr;
  const conPrimero = combinaciones(resto, k - 1).map(c => [primero, ...c]);
  const sinPrimero = combinaciones(resto, k);
  return [...conPrimero, ...sinPrimero];
}

/**
 * Dado un conjunto fijo de supermercados, calcula el costo óptimo del carrito
 * asignando cada producto al super más barato dentro de ese conjunto.
 * Si un producto no está en ninguno del conjunto, usa su precio más alto como estimación.
 */
function evaluarCombinacion(items: CartItem[], supers: string[]): ResultadoOptimizacion {
  const mapaSuper: Record<string, SupermercadoResultado> = {};
  supers.forEach(s => { mapaSuper[s] = { nombre: s, productos: [], subtotal: 0 }; });

  items.forEach(item => {
    // Buscar el precio más bajo dentro del conjunto
    const preciosDisponibles = item.producto.precios
      .filter(p => supers.includes(p.super))
      .sort((a, b) => a.valor - b.valor);

    const mejorPrecio = preciosDisponibles[0] ?? {
      super: supers[0],
      valor: Math.max(...item.producto.precios.map(p => p.valor)),
    };

    const subtotal = mejorPrecio.valor * item.cantidad;
    mapaSuper[mejorPrecio.super].productos.push({
      id: item.producto.id,
      nombre: item.producto.nombre,
      marca: item.producto.marca,
      imagen: item.producto.imagen,
      cantidad: item.cantidad,
      precio: mejorPrecio.valor,
      subtotal,
    });
    mapaSuper[mejorPrecio.super].subtotal += subtotal;
  });

  // Filtrar supermercados sin productos (puede pasar si todos los productos
  // tienen mejor precio en otros supers del conjunto)
  const supermercadosConProductos = Object.values(mapaSuper).filter(s => s.productos.length > 0);
  const totalGeneral = supermercadosConProductos.reduce((t, s) => t + s.subtotal, 0);

  return { supermercados: supermercadosConProductos, totalGeneral };
}

// ── Función principal ──────────────────────────────────────

/**
 * Encuentra la combinación de hasta `maxSupers` supermercados que minimiza
 * el costo total del carrito, probando todas las combinaciones posibles.
 */
export function optimizarCarrito(
  items: CartItem[],
  supermercadosDisponibles: string[],
  maxSupers: number
): ResultadoOptimizacion {
  let mejorResultado: ResultadoOptimizacion | null = null;

  for (let k = 1; k <= Math.min(maxSupers, supermercadosDisponibles.length); k++) {
    const combis = combinaciones(supermercadosDisponibles, k);
    for (const combi of combis) {
      const resultado = evaluarCombinacion(items, combi);
      if (!mejorResultado || resultado.totalGeneral < mejorResultado.totalGeneral) {
        mejorResultado = resultado;
      }
    }
  }

  // Fallback: no debería ocurrir si hay al menos un supermercado
  return mejorResultado ?? evaluarCombinacion(items, supermercadosDisponibles);
}
