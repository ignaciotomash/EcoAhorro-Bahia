import type {
  CartItem,
  TotalPorSuper,
  SupermercadoResultado,
  ResultadoOptimizacion,
  ProductoFaltante,
} from '@/features/carrito/types';

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
    } else {
      faltantes.push({ id: item.producto.id, nombre: item.producto.nombre, imagen: item.producto.imagen });
      total += Math.max(...item.producto.precios.map(p => p.valor)) * item.cantidad;
    }
  });

  return { total, faltantes };
}

export function calcularTotalesPorSuper(
  items: CartItem[],
  supermercados: string[],
  soloCompletos: boolean = false
): { resultados: TotalPorSuper[]; huboFallback: boolean } {
  const resultados = supermercados.map(nombre => {
    const { total, faltantes } = calcularTotalSuper(items, nombre);
    return { nombre, total, faltantes };
  });

  const ordenados = [...resultados].sort((a, b) => {
    if (a.faltantes.length !== b.faltantes.length) return a.faltantes.length - b.faltantes.length;
    return a.total - b.total; // empate en faltantes: el más barato primero
  });

  if (!soloCompletos) {
    // Orden normal: por precio, y en empate de precio, menos faltantes primero
    const porPrecio = [...resultados].sort((a, b) => {
      if (a.total !== b.total) return a.total - b.total;
      return a.faltantes.length - b.faltantes.length;
    });
    return { resultados: porPrecio, huboFallback: false };
  }

  const completos = ordenados.filter(r => r.faltantes.length === 0);
  if (completos.length > 0) {
    return { resultados: completos, huboFallback: false };
  }

  // Nadie tiene el 100%: devolvemos todos ordenados por más productos
  // disponibles (menos faltantes) y, en empate, el más barato.
  return { resultados: ordenados, huboFallback: true };
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

  const faltantesGenerales: ProductoFaltante[] = [];
  let totalFaltantesEstimado = 0;

  items.forEach(item => {
    const preciosDisponibles = item.producto.precios
      .filter(p => supers.includes(p.super))
      .sort((a, b) => a.valor - b.valor);

    if (preciosDisponibles.length === 0) {
      // No disponible en ningún super de esta combinación: no se asigna
      // a ningún supermercado (no aparece en ningún desplegable de compra),
      // pero SÍ se suma al total general con precio estimado, para que
      // la combinación no parezca más barata de lo que realmente es.
      faltantesGenerales.push({ id: item.producto.id, nombre: item.producto.nombre, imagen: item.producto.imagen });
      const precioEstimado = Math.max(...item.producto.precios.map(p => p.valor));
      totalFaltantesEstimado += precioEstimado * item.cantidad;
      return;
    }

    const mejorPrecio = preciosDisponibles[0];
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
  const totalGeneral =
    supermercadosConProductos.reduce((t, s) => t + s.subtotal, 0) + totalFaltantesEstimado;

  return { supermercados: supermercadosConProductos, totalGeneral, faltantes: faltantesGenerales };
}

export function optimizarCarrito(
  items: CartItem[],
  supermercadosDisponibles: string[],
  maxSupers: number,
  soloCompletos: boolean = false
): { resultado: ResultadoOptimizacion; huboFallback: boolean } {
  let mejorCompleto: ResultadoOptimizacion | null = null;
  let mejorPorMenosFaltantes: ResultadoOptimizacion | null = null;

  for (let k = 1; k <= Math.min(maxSupers, supermercadosDisponibles.length); k++) {
    const combis = combinaciones(supermercadosDisponibles, k);
    for (const combi of combis) {
      const resultado = evaluarCombinacion(items, combi);

      if (resultado.faltantes.length === 0) {
        if (!mejorCompleto || resultado.totalGeneral < mejorCompleto.totalGeneral) {
          mejorCompleto = resultado;
        }
      }

      // Candidato a "mejor aproximación": menos faltantes primero,
      // y en empate de faltantes, menor total.
      if (
        !mejorPorMenosFaltantes ||
        resultado.faltantes.length < mejorPorMenosFaltantes.faltantes.length ||
        (resultado.faltantes.length === mejorPorMenosFaltantes.faltantes.length &&
          resultado.totalGeneral < mejorPorMenosFaltantes.totalGeneral)
      ) {
        mejorPorMenosFaltantes = resultado;
      }
    }
  }

  if (!soloCompletos) {
    // Modo normal (sin filtro): el mejor por precio total, sin importar faltantes.
    let mejorPorPrecio: ResultadoOptimizacion | null = null;
    for (let k = 1; k <= Math.min(maxSupers, supermercadosDisponibles.length); k++) {
      const combis = combinaciones(supermercadosDisponibles, k);
      for (const combi of combis) {
        const resultado = evaluarCombinacion(items, combi);
        if (!mejorPorPrecio || resultado.totalGeneral < mejorPorPrecio.totalGeneral) {
          mejorPorPrecio = resultado;
        }
      }
    }
    return {
      resultado: mejorPorPrecio ?? evaluarCombinacion(items, supermercadosDisponibles),
      huboFallback: false,
    };
  }

  if (mejorCompleto) {
    return { resultado: mejorCompleto, huboFallback: false };
  }

  // Soicompletos=true y ninguna combinación cubrió el 100%: devolvemos
  // la de menos faltantes (y más barata en empate), marcando el fallback.
  return {
    resultado: mejorPorMenosFaltantes ?? evaluarCombinacion(items, supermercadosDisponibles),
    huboFallback: true,
  };
}