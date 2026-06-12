import { NextResponse } from 'next/server';
import { getProductoEanResponse } from '@/features/productos/services/productoEanService';
import { apiError } from '@/shared/lib/api-error';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonWithCors(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      ...init?.headers,
    },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ean: string }> }
) {
  try {
    const { ean } = await params;
    const data = await getProductoEanResponse(ean);

    if (!data) {
      return jsonWithCors(
        apiError('PRODUCTO_NO_ENCONTRADO', 'No se encontro un producto con el EAN indicado.', `EAN: ${ean}`),
        { status: 404 }
      );
    }

    return jsonWithCors(data);
  } catch (error) {
    console.error(error);
    return jsonWithCors(
      apiError('ERROR_BUSCANDO_PRODUCTO', 'No se pudo obtener el producto solicitado.'),
      { status: 500 }
    );
  }
}
