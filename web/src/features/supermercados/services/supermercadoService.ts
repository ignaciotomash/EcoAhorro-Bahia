import { unstable_cache } from 'next/cache';
import { findAll } from '../repositories/supermercadoRepository';

async function _getSupermercados() {
  return findAll();
}

export const getSupermercados = unstable_cache(
  _getSupermercados,
  ['supermercados-list'],
  { revalidate: 86400, tags: ['supermercados'] }
);
