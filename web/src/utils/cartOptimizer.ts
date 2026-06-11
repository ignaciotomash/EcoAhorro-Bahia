import type { CartItem, TotalPorSuper, ProductoEnSuper, SupermercadoResultado, ResultadoOptimizacion } from '@/features/carrito/types';

export function calcularTotalSuper(items: CartItem[], superNombre: string): number {
  return items.reduce((total, item) => {
    const precio = item.producto.precios.find(p => p.super === superNombre);
    const val = precio
      ? precio.valor
      : Math.max(...item.producto.precios.map(p => p.valor));
    return total + val * item.cantidad;
  }, 0);
}

export function calcularTotalesPorSuper(
  items: CartItem[],
  supermercados: string[]
): TotalPorSuper[] {
  return supermercados
    .map(nombre => ({ nombre, total: calcularTotalSuper(items, nombre) }))
    .sort((a, b) => a.total - b.total);
}

function combinaciones<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [primero, ...resto] = arr;
  const conPrimero = combinaciones(resto, k - 1).map(c => [primero, ...c]);
  const sinPrimero = combinaciones(resto, k);
  return [...conPrimero, ...sinPrimero];
}

function evaluarCombinacion(items: CartItem[], supers: string[]): ResultadoOptimizacion {
  const mapaSuper: Record<string, SupermercadoResultado> = {};
  supers.forEach(s => { mapaSuper[s] = { nombre: s, productos: [], subtotal: 0 }; });

  items.forEach(item => {
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

  const supermercadosConProductos = Object.values(mapaSuper).filter(s => s.productos.length > 0);
  const totalGeneral = supermercadosConProductos.reduce((t, s) => t + s.subtotal, 0);

  return { supermercados: supermercadosConProductos, totalGeneral };
}

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

  return mejorResultado ?? evaluarCombinacion(items, supermercadosDisponibles);
}
