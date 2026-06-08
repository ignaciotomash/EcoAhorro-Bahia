import { NextResponse } from 'next/server';
import { getProductosCatalogo } from '../../../services/db';
import { apiErrorResponse } from '../../../lib/api-error';

export const revalidate = 3600;

const SORT_OPTIONS = new Set(['price_asc', 'price_desc']);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '24');
    const categoriaParam = url.searchParams.get('categoria') || undefined;
    const sortBy = url.searchParams.get('sortBy') || undefined;
    const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
    const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
    const search = url.searchParams.get('search') || undefined;

    if (!Number.isInteger(page) || page < 1) {
      return apiErrorResponse(
        'PARAMETRO_INVALIDO',
        'El parametro page debe ser un entero mayor o igual a 1.',
        400,
        `page: ${url.searchParams.get('page')}`
      );
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return apiErrorResponse(
        'PARAMETRO_INVALIDO',
        'El parametro limit debe ser un entero entre 1 y 100.',
        400,
        `limit: ${url.searchParams.get('limit')}`
      );
    }

    if (sortBy && !SORT_OPTIONS.has(sortBy)) {
      return apiErrorResponse(
        'PARAMETRO_INVALIDO',
        'El parametro sortBy debe ser price_asc o price_desc.',
        400,
        `sortBy: ${sortBy}`
      );
    }

    if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) {
      return apiErrorResponse(
        'PARAMETRO_INVALIDO',
        'El parametro minPrice debe ser un numero mayor o igual a 0.',
        400,
        `minPrice: ${url.searchParams.get('minPrice')}`
      );
    }

    if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
      return apiErrorResponse(
        'PARAMETRO_INVALIDO',
        'El parametro maxPrice debe ser un numero mayor o igual a 0.',
        400,
        `maxPrice: ${url.searchParams.get('maxPrice')}`
      );
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return apiErrorResponse(
        'RANGO_PRECIO_INVALIDO',
        'El precio minimo no puede ser mayor que el precio maximo.',
        400,
        `minPrice: ${minPrice}, maxPrice: ${maxPrice}`
      );
    }

    const data = await getProductosCatalogo(page, limit, categoriaParam, sortBy, minPrice, maxPrice, search);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[productos] Error:', error);

    return apiErrorResponse(
      'ERROR_OBTENIENDO_PRODUCTOS',
      'No se pudo obtener el catalogo de productos.',
      500
    );
  }
}
