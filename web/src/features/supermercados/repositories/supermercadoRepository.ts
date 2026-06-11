import prisma from '@/shared/lib/prisma';

export async function findAll() {
  return prisma.supermercado.findMany({ orderBy: { nombre: 'asc' } });
}
