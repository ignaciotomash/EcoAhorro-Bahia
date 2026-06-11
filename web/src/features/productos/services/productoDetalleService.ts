import { unstable_cache } from 'next/cache';
import { findProductoByEan, findAllDolares } from '../repositories/productoRepository';
import { toProductoDetalleData } from '../mappers/productoMapper';

async function _getProductoDetalle(ean: string) {
  const [producto, dolares] = await Promise.all([
    findProductoByEan(ean),
    findAllDolares(),
  ]);
  return toProductoDetalleData(producto, dolares);
}

export const getProductoDetalle = unstable_cache(
  _getProductoDetalle,
  ['producto-detalle'],
  { revalidate: 3600, tags: ['productos'] }
);
