// src/lib/semanticResolver.ts

import { prisma } from "./prisma";
import { SINONIMOS } from "./sinonimos";

// ────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────

interface PrecioSupermercado {
  supermercado: string;
  precio: number;
  actualizacion: Date;
}

export interface ProductoResuelto {
  id: string;
  nombreProducto: string;
  marca: string;
  presentacion: string;
  imagen: string | null;
  relevancia: string;
  precios: PrecioSupermercado[];
  mejorPrecio: PrecioSupermercado | null;
}

// Tipo interno para el resultado crudo del $queryRaw
export interface ProductoFuzzyRaw {
  id: string;
  nombreProducto: string;
  marca: string;
  presentacion: string;
  imagen: string | null;
  score: number; //indica que tan parecido es el producto con el texto, entre 0 y 1.
}

// ────────────────────────────────────────────────────────────
// NORMALIZACIÓN
// ────────────────────────────────────────────────────────────
//Todo lo cargado se vuelve en minuscula, saca acentos y espacios innecesarios
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ────────────────────────────────────────────────────────────
// PASO 2: RESOLUCIÓN DE SINÓNIMOS
// Devuelve un array con el término original ingresado por el usuario
// después, si hay más de una palabra en el array, las separa y las busca una por separado.
// ────────────────────────────────────────────────────────────

export function resolverSinonimos(textoNormalizado: string): string[] {
  const terminos = new Set<string>();

  // Siempre incluir el texto original
  terminos.add(textoNormalizado);

  // Buscar la frase completa en el diccionario
  if (SINONIMOS[textoNormalizado]) {
    terminos.add(normalizar(SINONIMOS[textoNormalizado]));
  }

  // Buscar cada palabra suelta en el diccionario
  for (const palabra of textoNormalizado.split(" ")) {
    if (SINONIMOS[palabra]) {
      terminos.add(normalizar(SINONIMOS[palabra]));
    }
  }

  return [...terminos];
}

// ────────────────────────────────────────────────────────────
// PASO 3: BÚSQUEDA FUZZY CON pg_trgm
// Requiere: CREATE EXTENSION IF NOT EXISTS pg_trgm; en Supabase
async function buscarPorTermino(
  termino: string,
  umbral: number
): Promise<ProductoFuzzyRaw[]> {
  //usamos esto por que similarity es de postgres. Por lo que prisma no lo soporta. 
  //Esta haciendo consulta sobre toda la BD!!!!
  return prisma.$queryRaw<ProductoFuzzyRaw[]>` 
    SELECT DISTINCT ON (producto.id)
      producto.id,
      producto."nombreProducto",
      producto.marca,
      producto.presentacion,
      producto.imagen,
      GREATEST(
        similarity(lower(producto."nombreProducto"), ${termino}),
        similarity(lower(producto.marca),            ${termino})
      ) AS score
    FROM "Producto" producto
    WHERE
      GREATEST(
        similarity(lower(producto."nombreProducto"), ${termino}),
        similarity(lower(producto.marca),            ${termino})
      ) > ${umbral}
    ORDER BY producto.id, score DESC
    LIMIT 20
  `;
}

export async function buscarFuzzy(
  terminos: string[],
  umbral: number
): Promise<ProductoFuzzyRaw[]> {
  // Ejecutar una query por cada término en paralelo
  // hace una query sobre  toda la base de datos por cada término encontrado.
  const resultadosPorTermino = await Promise.all(
    terminos.map((termino) => buscarPorTermino(termino, umbral))
  );

  // Mergear todos los resultados en un solo mapa, quedándonos con
  // el score más alto cuando un mismo producto aparece en varios términos
  const mergeado = new Map<string, ProductoFuzzyRaw>();

  for (const resultados of resultadosPorTermino) {
    for (const producto of resultados) {
      const existente = mergeado.get(producto.id);
      if (!existente || producto.score > existente.score) {
        mergeado.set(producto.id, producto);
      }
    }
  }

  // Convertir a array y ordenar por score descendente
  return [...mergeado.values()].sort((a, b) => b.score - a.score);
}

// ────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL EXPORTABLE
// ────────────────────────────────────────────────────────────

/**
 * Convierte texto libre del usuario en productos del catálogo con precios.
 *
 * query  - Lo que escribe el usuario 
 * umbral - Qué tan estricto es el match. Default 0.15.
 */
export async function resolverBusqueda(
  query: string,
  umbral: number = 0.20
): Promise<ProductoResuelto[]> {
  const textoNormalizado = normalizar(query);
  const terminos = resolverSinonimos(textoNormalizado);
  const productosBase = await buscarFuzzy(terminos, umbral);

  if (productosBase.length === 0) return [];

  // Traer todos los precios de los productos encontrados
  const ids = productosBase.map((p) => p.id);

  const precios = await prisma.preciosUnificados.findMany({
    where: { idProducto: { in: ids } },
    include: { Supermercado: true },
    orderBy: { precio: "asc" },
  });

  // Agrupar precios por idProducto
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

  // Combinar datos y devolver resultado final
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
