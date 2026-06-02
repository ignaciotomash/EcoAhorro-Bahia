import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supermercados = await prisma.supermercado.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(supermercados);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error obteniendo supermercados' },
      { status: 500 }
    );
  }
}