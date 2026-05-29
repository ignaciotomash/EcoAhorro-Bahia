import prisma from '../lib/prisma';

export async function getProductosCatalogo(
  page = 1,
  limit = 100,
  categoriasInput?: string | string[],
  sortBy?: string,
  minPrice?: number,
  maxPrice?: number
) {
  const skip = (page - 1) * limit;

  // Normalizar las categorías a un array
  const listaCategorias = Array.isArray(categoriasInput)
    ? categoriasInput
    : categoriasInput && categoriasInput !== 'Todas'
      ? categoriasInput.split(',').filter(Boolean)
      : [];

  const hayFiltrosPrecio = !!sortBy || minPrice !== undefined || maxPrice !== undefined;

  // Construir valores para la query
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

  // Construir WHERE clause
  const whereConditions: string[] = [];
  if (categoriaIds.length > 0) {
    whereConditions.push(`p."idCategoria" IN ('${categoriaIds.join("','")}')`);
  }
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Construir HAVING clause
  const havingConditions: string[] = [];
  if (hayFiltrosPrecio) {
    havingConditions.push(`MIN(CAST(pu.precio AS DECIMAL)) > 0`);
  }
  if (minPrice !== undefined) {
    havingConditions.push(`MIN(CAST(pu.precio AS DECIMAL)) >= ${minPrice}`);
  }
  if (maxPrice !== undefined) {
    havingConditions.push(`MIN(CAST(pu.precio AS DECIMAL)) <= ${maxPrice}`);
  }
  const havingClause = havingConditions.length > 0 ? `HAVING ${havingConditions.join(' AND ')}` : '';

  // Construir ORDER clause
  const orderClause = sortBy === 'price_desc' 
    ? 'ORDER BY min_precio DESC' 
    : sortBy === 'price_asc'
    ? 'ORDER BY min_precio ASC'
    : '';

  // Query para contar y obtener IDs
  const countQuery = `
    SELECT p.id, MIN(CAST(pu.precio AS DECIMAL)) as min_precio
    FROM "Producto" p
    LEFT JOIN "PreciosUnificados" pu ON p.id = pu."idProducto"
    ${whereClause}
    GROUP BY p.id
    ${havingClause}
    ${orderClause}
  `;

  const countResult = await prisma.$queryRawUnsafe<{ id: string; min_precio: number }[]>(countQuery);
  
  const totalCount = countResult.length;
  const idsParaTraer = countResult.slice(skip, skip + limit).map(r => r.id);

  if (idsParaTraer.length === 0) {
    return {
      productos: [],
      totalPages: Math.ceil(totalCount / limit),
      totalProductos: totalCount,
    };
  }

  // Traer datos completos SOLO de los productos de esta página
  const productosDb = await prisma.producto.findMany({
    where: {
      id: { in: idsParaTraer },
    },
    select: {
      id: true,
      nombreProducto: true,
      marca: true,
      imagen: true,
      Categoria: {
        select: { nombre: true },
      },
      PreciosUnificados: {
        select: {
          precio: true,
          Supermercado: {
            select: { nombre: true },
          },
        },
        orderBy: { precio: 'asc' },
      },
    },
  });

  // Mantener el orden de la query SQL
  const productosTransformados = idsParaTraer.map(id => {
    const p = productosDb.find(prod => prod.id === id);
    if (!p) return null;
    
    return {
      id: p.id,
      nombre: p.nombreProducto,
      marca: p.marca,
      categoria: p.Categoria?.nombre || 'General',
      imagen: p.imagen || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Sin+Imagen',
      precios: p.PreciosUnificados.map((precio: any) => ({
        super: precio.Supermercado.nombre,
        valor: precio.precio,
      })),
    };
  }).filter(Boolean);

  return {
    productos: productosTransformados,
    totalPages: Math.ceil(totalCount / limit),
    totalProductos: totalCount,
  };
}

export async function getCategorias() {
  return await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' }
  });
}
