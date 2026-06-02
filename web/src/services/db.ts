import prisma from '../lib/prisma';
import { unstable_cache } from 'next/cache';

type ProductoTransformado = {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  imagen: string;
  precios: { super: string; valor: number }[];
};

type RawProductoRow = {
  id: string;
  nombreProducto: string;
  marca: string;
  imagen: string | null;
  categoriaNombre: string | null;
  precioValor: number | null;
  supermercadoNombre: string | null;
  total_count: bigint | number;
};

async function _getProductosCatalogo(
  page = 1,
  limit = 24,
  categoriasInput?: string | string[],
  sortBy?: string,
  minPrice?: number,
  maxPrice?: number,
  searchQuery?: string
) {
  const skip = (page - 1) * limit;

  // Normalizar las categorías a un array
  const listaCategorias = Array.isArray(categoriasInput)
    ? categoriasInput
    : categoriasInput && categoriasInput !== 'Todas'
      ? categoriasInput.split(',').filter(Boolean)
      : [];

  // Resolver IDs de categoría si se proporcionaron nombres
  let categoriaIds: string[] = [];
  if (listaCategorias.length > 0) {
    const categorias = await prisma.categoria.findMany({
      where: {
        OR: [
          { id: { in: listaCategorias } },
          { nombre: { in: listaCategorias } },
        ],
      },
      select: { id: true },
    });
    categoriaIds = categorias.map(c => c.id);
  }

  // === CONSTRUIR UNA SOLA QUERY SQL OPTIMIZADA ===

  // 1. WHERE conditions para la tabla Producto
  const whereConditions: string[] = [];
  if (categoriaIds.length > 0) {
    whereConditions.push(`p."idCategoria" IN ('${categoriaIds.join("','")}')`);
  }
  if (searchQuery && searchQuery.trim() !== '') {
    const safeSearch = searchQuery.replace(/'/g, "''");
    whereConditions.push(`p."nombreProducto" ILIKE '%${safeSearch}%'`);
  }
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // 2. HAVING conditions (filtros de precio)
  const hayFiltrosPrecio = !!sortBy || minPrice !== undefined || maxPrice !== undefined;
  const havingConditions: string[] = [];
  if (hayFiltrosPrecio) {
    havingConditions.push(`MIN(pu.precio) > 0`);
  }
  if (minPrice !== undefined) {
    havingConditions.push(`MIN(pu.precio) >= ${minPrice}`);
  }
  if (maxPrice !== undefined) {
    havingConditions.push(`MIN(pu.precio) <= ${maxPrice}`);
  }
  const havingClause = havingConditions.length > 0 ? `HAVING ${havingConditions.join(' AND ')}` : '';

  // 3. ORDER clause (for the CTE - uses CTE columns)
  const orderClause = sortBy === 'price_desc'
    ? 'ORDER BY min_precio DESC'
    : sortBy === 'price_asc'
    ? 'ORDER BY min_precio ASC'
    : 'ORDER BY nombre_producto ASC';

  // === QUERY ÚNICA: obtiene los IDs paginados + total count con window function ===
  const mainQuery = `
    WITH filtered_products AS (
      SELECT 
        p.id,
        p."nombreProducto" as nombre_producto,
        MIN(pu.precio) as min_precio,
        COUNT(*) OVER() as total_count
      FROM "Producto" p
      LEFT JOIN "PreciosUnificados" pu ON p.id = pu."idProducto"
      ${whereClause}
      GROUP BY p.id, p."nombreProducto"
      ${havingClause}
    )
    SELECT 
      fp.total_count,
      p.id,
      p."nombreProducto",
      p.marca,
      p.imagen,
      c.nombre as "categoriaNombre",
      pu.precio as "precioValor",
      s.nombre as "supermercadoNombre"
    FROM (
      SELECT id, total_count
      FROM filtered_products
      ${orderClause}
      LIMIT ${limit} OFFSET ${skip}
    ) fp
    JOIN "Producto" p ON p.id = fp.id
    LEFT JOIN "Categoria" c ON p."idCategoria" = c.id
    LEFT JOIN "PreciosUnificados" pu ON p.id = pu."idProducto"
    LEFT JOIN "Supermercado" s ON pu."idSupermercado" = s.id
    ORDER BY p."nombreProducto" ASC, pu.precio ASC
  `;

  const rows = await prisma.$queryRawUnsafe<RawProductoRow[]>(mainQuery);

  if (rows.length === 0) {
    return {
      productos: [] as ProductoTransformado[],
      totalPages: 0,
      totalProductos: 0,
    };
  }

  // Obtener el total del primer row (window function lo pone en todas las filas)
  const totalCount = Number(rows[0].total_count);

  // Agrupar los rows por producto (cada producto puede tener múltiples precios)
  const productosMap = new Map<string, ProductoTransformado>();

  for (const row of rows) {
    let producto = productosMap.get(row.id);
    if (!producto) {
      producto = {
        id: row.id,
        nombre: row.nombreProducto,
        marca: row.marca,
        categoria: row.categoriaNombre || 'General',
        imagen: row.imagen || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Sin+Imagen',
        precios: [],
      };
      productosMap.set(row.id, producto);
    }

    if (row.precioValor !== null && row.supermercadoNombre !== null) {
      // Evitar duplicados de precio
      const yaExiste = producto.precios.some(
        p => p.super === row.supermercadoNombre && p.valor === row.precioValor
      );
      if (!yaExiste) {
        producto.precios.push({
          super: row.supermercadoNombre,
          valor: row.precioValor,
        });
      }
    }
  }

  // Ordenar precios de menor a mayor dentro de cada producto
  const productos = Array.from(productosMap.values());
  for (const p of productos) {
    p.precios.sort((a, b) => a.valor - b.valor);
  }

  return {
    productos,
    totalPages: Math.ceil(totalCount / limit),
    totalProductos: totalCount,
  };
}

export const getProductosCatalogo = unstable_cache(
  _getProductosCatalogo,
  ['productos-catalogo-v2'],
  { revalidate: 3600, tags: ['productos'] }
);

async function _getCategorias() {
  return await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' }
  });
}

export const getCategorias = unstable_cache(
  _getCategorias,
  ['categorias-query'],
  { revalidate: 86400, tags: ['categorias'] }
);
