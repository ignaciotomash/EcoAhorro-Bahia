import { Prisma } from '@prisma/client';
import prisma from '@/shared/lib/prisma';
import type { RawProductoRow, ProductoFuzzyRaw } from '@/features/productos/types';

export async function findProductosRaw(
  page: number,
  limit: number,
  categoriaIds: string[],
  fuzzyIds: string[] | null,
  searchString: string,
  tieneSearch: boolean,
  sortBy: string | undefined,
  minPrice: number | undefined,
  maxPrice: number | undefined
) {
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.Sql[] = [];
  if (categoriaIds.length > 0) {
    whereConditions.push(Prisma.sql`p."idCategoria" IN (${Prisma.join(categoriaIds)})`);
  }
  if (fuzzyIds) {
    whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(fuzzyIds)})`);
  } else if (tieneSearch) {
    whereConditions.push(Prisma.sql`p."nombreProducto" ILIKE ${'%' + searchString + '%'}`);
  }
  const whereClause = whereConditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
    : Prisma.empty;

  const hayFiltrosPrecio = !!sortBy || minPrice !== undefined || maxPrice !== undefined;
  const havingConditions: Prisma.Sql[] = [];
  if (hayFiltrosPrecio) {
    havingConditions.push(Prisma.sql`MIN(pu.precio) > 0`);
  }
  if (minPrice !== undefined) {
    havingConditions.push(Prisma.sql`MIN(pu.precio) >= ${minPrice}`);
  }
  if (maxPrice !== undefined) {
    havingConditions.push(Prisma.sql`MIN(pu.precio) <= ${maxPrice}`);
  }
  const havingClause = havingConditions.length > 0
    ? Prisma.sql`HAVING ${Prisma.join(havingConditions, ' AND ')}`
    : Prisma.empty;

  let orderClause: Prisma.Sql;
  let finalOrderClause: Prisma.Sql;
  if (sortBy === 'price_desc') {
    orderClause = Prisma.sql`ORDER BY min_precio DESC`;
    finalOrderClause = Prisma.sql`ORDER BY fp.min_precio DESC, pu.precio ASC`;
  } else if (sortBy === 'price_asc') {
    orderClause = Prisma.sql`ORDER BY min_precio ASC`;
    finalOrderClause = Prisma.sql`ORDER BY fp.min_precio ASC, pu.precio ASC`;
  } else if (fuzzyIds) {
    orderClause = Prisma.sql`ORDER BY array_position(ARRAY[${Prisma.join(fuzzyIds)}]::text[], id)`;
    finalOrderClause = Prisma.sql`ORDER BY array_position(ARRAY[${Prisma.join(fuzzyIds)}]::text[], p.id), pu.precio ASC`;
  } else {
    orderClause = Prisma.sql`ORDER BY nombre_producto ASC`;
    finalOrderClause = Prisma.sql`ORDER BY p."nombreProducto" ASC, pu.precio ASC`;
  }

  const mainQuery = Prisma.sql`
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
      SELECT id, total_count, min_precio
      FROM filtered_products
      ${orderClause}
      LIMIT ${limit} OFFSET ${skip}
    ) fp
    JOIN "Producto" p ON p.id = fp.id
    LEFT JOIN "Categoria" c ON p."idCategoria" = c.id
    LEFT JOIN "PreciosUnificados" pu ON p.id = pu."idProducto"
    LEFT JOIN "Supermercado" s ON pu."idSupermercado" = s.id
    ${finalOrderClause}
  `;

  return prisma.$queryRaw<RawProductoRow[]>(mainQuery);
}

export async function findCategoriaIdsByNamesOrIds(listaCategorias: string[]) {
  const categorias = await prisma.categoria.findMany({
    where: {
      OR: [
        { id: { in: listaCategorias } },
        { nombre: { in: listaCategorias } },
      ],
    },
    select: { id: true },
  });
  return categorias.map(c => c.id);
}

export async function findCategorias() {
  return prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
}

export async function countSupermercados() {
  return prisma.supermercado.count();
}

export async function findProductoByEan(ean: string) {
  return prisma.producto.findUnique({
    where: { id: ean },
    include: {
      Categoria: true,
      HistorialPrecios: { orderBy: { fechaGuardado: 'asc' } },
      PreciosUnificados: {
        include: { Supermercado: true },
        orderBy: { precio: 'asc' },
      },
    },
  });
}

export async function findAllDolares() {
  return prisma.precioDolar.findMany({ orderBy: { fechaGuardado: 'asc' } });
}

export async function findProductIdsWithPrices(limit = 200) {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT DISTINCT p.id
    FROM "Producto" p
    INNER JOIN "PreciosUnificados" pu ON p.id = pu."idProducto"
    LIMIT ${limit}
  `;
  return rows.map(r => r.id);
}
