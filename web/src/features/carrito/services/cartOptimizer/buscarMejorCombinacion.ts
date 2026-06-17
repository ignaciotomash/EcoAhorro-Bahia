import type { CartItem, ResultadoOptimizacion } from '@/features/carrito/types';
import { evaluarCombinacion } from './evaluarCombinacion';

/**
 * Genera todas las combinaciones posibles de tamaño k a partir de un arreglo.
 * Ej: combinaciones(['A','B','C'], 2) => [['A','B'], ['A','C'], ['B','C']]
 */
function combinaciones<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];

  const [primero, ...resto] = arr;
  const conPrimero = combinaciones(resto, k - 1).map(c => [primero, ...c]);
  const sinPrimero = combinaciones(resto, k);

  return [...conPrimero, ...sinPrimero];
}

type ResultadoBusqueda = {
  resultado: ResultadoOptimizacion;
  /** true si soloCompletos estaba activo pero ninguna combinación cubría el 100% dentro del límite de supers */
  huboFallback: boolean;
};

function esMejorPorPrecio(
  candidato: ResultadoOptimizacion,
  actual: ResultadoOptimizacion | null
): boolean {
  return !actual || candidato.totalGeneral < actual.totalGeneral;
}

function esMejorPorMenosFaltantes(
  candidato: ResultadoOptimizacion,
  actual: ResultadoOptimizacion | null
): boolean {
  if (!actual) return true;
  if (candidato.faltantes.length !== actual.faltantes.length) {
    return candidato.faltantes.length < actual.faltantes.length;
  }
  return candidato.totalGeneral < actual.totalGeneral;
}

/**
 * Recorre todas las combinaciones de supermercados de tamaño 1..maxSupers
 * y devuelve la mejor según el criterio pedido.
 *
 * - Sin `soloCompletos`: la de menor `totalGeneral`, sin importar si tiene
 *   productos faltantes (se estiman al precio máximo, como siempre).
 * - Con `soloCompletos`: la de menor `totalGeneral` ENTRE las que tienen
 *   0 faltantes. Si ninguna combinación dentro del límite de supers cubre
 *   el 100% del carrito, cae a la de menos faltantes (empate -> más barata)
 *   y marca `huboFallback = true`.
 */
export function buscarMejorCombinacion(
  items: CartItem[],
  supermercadosDisponibles: string[],
  maxSupers: number,
  soloCompletos: boolean
): ResultadoBusqueda {
  let mejorPorPrecio: ResultadoOptimizacion | null = null;
  let mejorCompleto: ResultadoOptimizacion | null = null;
  let mejorPorMenosFaltantes: ResultadoOptimizacion | null = null;

  const tope = Math.min(maxSupers, supermercadosDisponibles.length);

  for (let k = 1; k <= tope; k++) {
    for (const combi of combinaciones(supermercadosDisponibles, k)) {
      const resultado = evaluarCombinacion(items, combi);

      if (esMejorPorPrecio(resultado, mejorPorPrecio)) {
        mejorPorPrecio = resultado;
      }

      if (resultado.faltantes.length === 0 && esMejorPorPrecio(resultado, mejorCompleto)) {
        mejorCompleto = resultado;
      }

      if (esMejorPorMenosFaltantes(resultado, mejorPorMenosFaltantes)) {
        mejorPorMenosFaltantes = resultado;
      }
    }
  }

  const fallbackTotal = evaluarCombinacion(items, supermercadosDisponibles);

  if (!soloCompletos) {
    return { resultado: mejorPorPrecio ?? fallbackTotal, huboFallback: false };
  }

  if (mejorCompleto) {
    return { resultado: mejorCompleto, huboFallback: false };
  }

  return { resultado: mejorPorMenosFaltantes ?? fallbackTotal, huboFallback: true };
}

/**
 * Punto de entrada del modo "máximo de supermercados a visitar".
 * Nombre histórico que ya consume CarritoPage.tsx; delega toda la lógica
 * en buscarMejorCombinacion.
 */
export function optimizarCarrito(
  items: CartItem[],
  supermercadosDisponibles: string[],
  maxSupers: number,
  soloCompletos: boolean = false
): ResultadoBusqueda {
  return buscarMejorCombinacion(items, supermercadosDisponibles, maxSupers, soloCompletos);
}