import prisma from '../lib/prisma';

export async function getProductosCatalogo(page = 1, limit = 100, categoriasInput?: string | string[]) {
  const skip = (page - 1) * limit;

  // Normalizar las categorías a un array
  const listaCategorias = Array.isArray(categoriasInput) 
    ? categoriasInput 
    : categoriasInput && categoriasInput !== 'Todas' 
      ? categoriasInput.split(',') 
      : [];

  // Filtro de búsqueda múltiple
  const where = listaCategorias.length > 0 
    ? { Categoria: { nombre: { in: listaCategorias } } } 
    : {};

  const [productosDb, totalCount] = await Promise.all([
    prisma.producto.findMany({
      where,
      skip,
      take: limit,
      include: {
        Categoria: true,
        PreciosUnificados: {
          include: {
            Supermercado: true,
          },
          orderBy: {
            precio: 'asc',
          },
        },
      },
    }),
    prisma.producto.count({ where }),
  ]);

  const productosTransformados = productosDb.map((p) => {
    return {
      id: p.id,
      nombre: p.nombreProducto,
      marca: p.marca,
      categoria: p.Categoria?.nombre || 'General',
      imagen: p.imagen || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Sin+Imagen',
      precios: p.PreciosUnificados.map((precio) => ({
        super: precio.Supermercado.nombre,
        valor: precio.precio,
      })),
    };
  });

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
