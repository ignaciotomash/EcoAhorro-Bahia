import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { apiErrorResponse } from '@/shared/lib/api-error';

export async function GET() {
  try {
    const supermercados = await prisma.supermercado.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(supermercados);
  } catch (error) {
    console.error(error);
    return apiErrorResponse(
      'ERROR_OBTENIENDO_SUPERMERCADOS',
      'No se pudo obtener el listado de supermercados.',
      500
    );
  }
}
