import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUsuario } from '../../../../../lib/usuarios';

type RouteContext = {
  params: Promise<{
    productoId: string;
  }>;
};

type UpdateItemBody = {
  cantidad?: number;
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

export async function PATCH(request: Request, context: RouteContext) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { productoId } = await context.params;
  const body = (await request.json()) as UpdateItemBody;
  const cantidad = Number(body.cantidad);

  if (!Number.isInteger(cantidad)) {
    return NextResponse.json({ error: 'cantidad debe ser un entero' }, { status: 400 });
  }

  const carrito = await getOrCreateCarrito(usuario.id);
  const itemKey = {
    carritoId: carrito.id,
    idProducto: productoId,
  };

  if (cantidad <= 0) {
    await prisma.carritoItem.deleteMany({
      where: itemKey,
    });

    return NextResponse.json({ ok: true });
  }

  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { id: true },
  });

  if (!producto) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  const item = await prisma.carritoItem.upsert({
    where: {
      carritoId_idProducto: itemKey,
    },
    create: {
      ...itemKey,
      cantidad,
    },
    update: {
      cantidad,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { productoId } = await context.params;
  const carrito = await getOrCreateCarrito(usuario.id);

  await prisma.carritoItem.deleteMany({
    where: {
      carritoId: carrito.id,
      idProducto: productoId,
    },
  });

  return NextResponse.json({ ok: true });
}