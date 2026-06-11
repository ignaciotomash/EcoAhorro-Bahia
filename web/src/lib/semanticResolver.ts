import { prisma } from "../shared/lib/prisma";
import { SINONIMOS } from "./sinonimos";
import type { ProductoResuelto, PrecioSupermercado, ProductoFuzzyRaw } from "@/features/productos/types";

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolverSinonimos(textoNormalizado: string): string[] {
  const terminos = new Set<string>();

  terminos.add(textoNormalizado);

  if (SINONIMOS[textoNormalizado]) {
    terminos.add(normalizar(SINONIMOS[textoNormalizado]));
  }

  for (const palabra of textoNormalizado.split(" ")) {
    if (SINONIMOS[palabra]) {
      terminos.add(normalizar(SINONIMOS[palabra]));
    }
  }

  return [...terminos];
}

async function buscarPorTermino(
  termino: string,
  umbral: number,
  limite: number = 20
): Promise<ProductoFuzzyRaw[]> {
  return prisma.$queryRaw<ProductoFuzzyRaw[]>`
    SELECT * FROM (
      SELECT
        producto.id,
        producto."nombreProducto",
        producto.marca,
        producto.presentacion,
        producto.imagen,
        GREATEST(
          similarity(lower(producto."nombreProducto"), ${termino}),
          similarity(lower(producto.marca), ${termino}) * 0.3
        ) AS score
      FROM "Producto" producto
      WHERE
        lower(producto."nombreProducto") ILIKE ${'%' + termino + '%'}
        OR similarity(lower(producto."nombreProducto"), ${termino}) > ${umbral}
        OR similarity(lower(producto.marca), ${termino}) > ${umbral}
    ) sub
    ORDER BY score DESC
    LIMIT ${limite}
  `;
}

export async function buscarFuzzy(
  terminos: string[],
  umbral: number,
  limite: number = 20
): Promise<ProductoFuzzyRaw[]> {
  const resultadosPorTermino = await Promise.all(
    terminos.map((termino) => buscarPorTermino(termino, umbral, limite))
  );

  const mergeado = new Map<string, ProductoFuzzyRaw>();

  for (const resultados of resultadosPorTermino) {
    for (const producto of resultados) {
      const existente = mergeado.get(producto.id);
      if (!existente || producto.score > existente.score) {
        mergeado.set(producto.id, producto);
      }
    }
  }

  return [...mergeado.values()].sort((a, b) => b.score - a.score);
}

export async function resolverBusqueda(
  query: string,
  umbral: number = 0.20
): Promise<ProductoResuelto[]> {
  const textoNormalizado = normalizar(query);
  const terminos = resolverSinonimos(textoNormalizado);
  const productosBase = await buscarFuzzy(terminos, umbral);

  if (productosBase.length === 0) return [];

  const ids = productosBase.map((p) => p.id);

  const precios = await prisma.preciosUnificados.findMany({
    where: { idProducto: { in: ids } },
    include: { Supermercado: true },
    orderBy: { precio: "asc" },
  });

  const preciosPorProducto = precios.reduce<Record<string, PrecioSupermercado[]>>(
    (acc: Record<string, PrecioSupermercado[]>, p: any) => {
      if (!acc[p.idProducto]) acc[p.idProducto] = [];
      acc[p.idProducto].push({
        supermercado: p.Supermercado.nombre,
        precio: p.precio,
        actualizacion: p.actualizacion,
      });
      return acc;
    },
    {}
  );

  return productosBase.map((producto) => ({
    id: producto.id,
    nombreProducto: producto.nombreProducto,
    marca: producto.marca,
    presentacion: producto.presentacion,
    imagen: producto.imagen,
    relevancia: Number(producto.score).toFixed(2),
    precios: preciosPorProducto[producto.id] ?? [],
    mejorPrecio: preciosPorProducto[producto.id]?.[0] ?? null,
  }));
}
