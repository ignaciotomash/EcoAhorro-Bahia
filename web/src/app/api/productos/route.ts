import { NextResponse } from 'next/server';
import { getProductosCatalogo } from '../../../services/db';

export const revalidate = 3600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || '1');
  const limit = Number(url.searchParams.get('limit') || '24');
  const categoriaParam = url.searchParams.get('categoria') || undefined;
  const sortBy = url.searchParams.get('sortBy') || undefined;
  const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
  const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
  const search = url.searchParams.get('search') || undefined;

  const data = await getProductosCatalogo(page, limit, categoriaParam, sortBy, minPrice, maxPrice, search);

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
