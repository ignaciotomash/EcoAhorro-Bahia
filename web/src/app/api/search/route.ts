import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { resolverBusqueda } from '@/lib/semanticResolver';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return apiErrorResponse(
      'BUSQUEDA_INVALIDA',
      'Ingresa al menos 2 caracteres para buscar.',
      400,
      query ? `q: ${query}` : 'q no informado'
    );
  }

  try {
    const productos = await resolverBusqueda(query);

    return NextResponse.json({
      query,
      total: productos.length,
      resultados: productos,
    });
  } catch (error) {
    console.error('[search] Error:', error);

    return apiErrorResponse(
      'ERROR_BUSCANDO_PRODUCTOS',
      'No se pudo resolver la busqueda de productos.',
      500
    );
  }
}
