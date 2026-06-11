import { randomUUID } from 'crypto';
import prisma from '@/shared/lib/prisma';

export async function getOrCreateCarrito(usuarioId: string) {
  return prisma.carrito.upsert({
    where: { usuarioId },
    create: { id: randomUUID(), usuarioId },
    update: {},
  });
}

export async function findCartItems(carritoId: string) {
  return prisma.carritoItem.findMany({
    where: { carritoId },
    include: {
      Producto: {
        include: {
          Categoria: true,
          PreciosUnificados: { include: { Supermercado: true } },
        },
      },
    },
    orderBy: { Producto: { nombreProducto: 'asc' } },
  });
}

export async function upsertCartItem(carritoId: string, productoId: string, cantidad: number) {
  return prisma.carritoItem.upsert({
    where: { carritoId_idProducto: { carritoId, idProducto: productoId } },
    create: { carritoId, idProducto: productoId, cantidad },
    update: { cantidad },
  });
}

export async function findProductoById(productoId: string) {
  return prisma.producto.findUnique({ where: { id: productoId }, select: { id: true } });
}

export async function deleteCartItem(carritoId: string, productoId: string) {
  return prisma.carritoItem.deleteMany({
    where: { carritoId, idProducto: productoId },
  });
}

export async function clearCartItems(carritoId: string) {
  return prisma.carritoItem.deleteMany({ where: { carritoId } });
}
