import { NextResponse } from 'next/server';
import { getSupermercados } from '@/features/supermercados/services/supermercadoService';
import { apiErrorResponse } from '@/shared/lib/api-error';

export async function GET() {
  try {
    const supermercados = await getSupermercados();
    return NextResponse.json(supermercados, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      },
    });
  } catch (error) {
    console.error(error);
    return apiErrorResponse(
      'ERROR_OBTENIENDO_SUPERMERCADOS',
      'No se pudo obtener el listado de supermercados.',
      500
    );
  }
}
