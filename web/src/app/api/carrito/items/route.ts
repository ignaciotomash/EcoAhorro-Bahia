import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUsuario } from '../../../../lib/usuarios';

type AddItemBody = {
  productoId?: string;
};

async function getOrCreateCarrito(usuarioId: string) {
  return prisma.carrito.upsert({
    where: { usuarioId },
    create: {
      id: randomUUID(),
      usuarioId,
    },
    update: {},
  });
}

export async function POST(request: Request) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = (await request.json()) as AddItemBody;
  const productoId = body.productoId?.trim();

  if (!productoId) {
    return NextResponse.json({ error: 'productoId es requerido' }, { status: 400 });
  }

  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { id: true },
  });

  if (!producto) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  const carrito = await getOrCreateCarrito(usuario.id);

  const item = await prisma.carritoItem.upsert({
    where: {
      carritoId_idProducto: {
        carritoId: carrito.id,
        idProducto: productoId,
      },
    },
    create: {
      carritoId: carrito.id,
      idProducto: productoId,
      cantidad: 1,
    },
    update: {
      cantidad: {
        increment: 1,
      },
    },
  });

  return NextResponse.json(item, { status: 201 });
}