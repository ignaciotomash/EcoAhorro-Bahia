import type {
  CartItem,
  SupermercadoResultado,
  ResultadoOptimizacion,
  ProductoFaltante,
} from '@/features/carrito/types';

/**
 * Dado un carrito y un conjunto fijo de supermercados, asigna cada producto
 * al supermercado donde sale más barato. Los productos que no están
 * disponibles en NINGUNO de esos supermercados no se asignan a ninguno
 * (no aparecen en los desplegables de compra); quedan registrados aparte
 * en `faltantes`, y su precio estimado (el máximo entre todos los supers
 * donde sí existe el producto) se suma igual al `totalGeneral`, para que
 * una combinación incompleta no aparente ser más barata de lo que es.
 */
export function evaluarCombinacion(items: CartItem[], supers: string[]): ResultadoOptimizacion {
  const mapaSuper: Record<string, SupermercadoResultado> = {};
  supers.forEach(s => { mapaSuper[s] = { nombre: s, productos: [], subtotal: 0 }; });

  const faltantes: ProductoFaltante[] = [];
  let totalFaltantesEstimado = 0;

  items.forEach(item => {
    const preciosDisponibles = item.producto.precios
      .filter(p => supers.includes(p.super))
      .sort((a, b) => a.valor - b.valor);

    if (preciosDisponibles.length === 0) {
      faltantes.push({
        id: item.producto.id,
        nombre: item.producto.nombre,
        imagen: item.producto.imagen,
      });
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

  return { supermercados: supermercadosConProductos, totalGeneral, faltantes };
}