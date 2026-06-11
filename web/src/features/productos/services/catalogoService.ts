import { unstable_cache } from 'next/cache';
import { findProductosRaw, findCategoriaIdsByNamesOrIds, findCategorias as repoFindCategorias, countSupermercados as repoCountSuper } from '../repositories/productoRepository';
import { toProductoCatalogo } from '../mappers/productoMapper';
import { normalizar, resolverSinonimos, buscarFuzzy } from './semanticResolver';

async function _getProductosCatalogo(
  page = 1,
  limit = 24,
  categoriasInput?: string | string[],
  sortBy?: string,
  minPrice?: number,
  maxPrice?: number,
  searchQuery?: string
) {
  const listaCategorias = Array.isArray(categoriasInput)
    ? categoriasInput
    : categoriasInput && categoriasInput !== 'Todas'
      ? categoriasInput.split(',').filter(Boolean)
      : [];

  let categoriaIds: string[] = [];
  if (listaCategorias.length > 0) {
    categoriaIds = await findCategoriaIdsByNamesOrIds(listaCategorias);
  }

  let fuzzyIds: string[] | null = null;
  const searchString = searchQuery?.trim() || '';
  const tieneSearch = searchString.length > 0;
  if (tieneSearch) {
    const textoNormalizado = normalizar(searchString);
    const terminos = resolverSinonimos(textoNormalizado);
    const productosFuzzy = await buscarFuzzy(terminos, 0.3, 100);

    if (productosFuzzy.length >= 5) {
      fuzzyIds = productosFuzzy.map(p => p.id);
    }
  }

  const rows = await findProductosRaw(
    page, limit, categoriaIds, fuzzyIds, searchString, tieneSearch,
    sortBy, minPrice, maxPrice
  );

  const { productos, totalProductos } = toProductoCatalogo(rows);

  return {
    productos,
    totalPages: Math.ceil(totalProductos / limit) || 0,
    totalProductos,
  };
}

export const getProductosCatalogo = unstable_cache(
  _getProductosCatalogo,
  ['productos-catalogo-v2'],
  { revalidate: 3600, tags: ['productos'] }
);

export const getCategorias = unstable_cache(
  repoFindCategorias,
  ['categorias-query'],
  { revalidate: 86400, tags: ['categorias'] }
);

export const getSupermercadosCount = unstable_cache(
  repoCountSuper,
  ['supermercados-count'],
  { revalidate: 86400, tags: ['supermercados'] }
);
