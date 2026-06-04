import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getCurrentUsuario } from '../../../lib/usuarios';

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

function formatCart(items: Awaited<ReturnType<typeof findCartItems>>) {
  return {
    items: items.map(item => ({
      producto: {
        id: item.Producto.id,
        nombre: item.Producto.nombreProducto,
        marca: item.Producto.marca,
        categoria: item.Producto.Categoria?.nombre ?? 'General',
        imagen: item.Producto.imagen ?? undefined,
        precios: item.Producto.PreciosUnificados
          .map(precio => ({
            super: precio.Supermercado.nombre,
            valor: precio.precio,
          }))
          .sort((a, b) => a.valor - b.valor),
      },
      cantidad: item.cantidad,
    })),
  };
}

async function findCartItems(carritoId: string) {
  return prisma.carritoItem.findMany({
    where: { carritoId },
    include: {
      Producto: {
        include: {
          Categoria: true,
          PreciosUnificados: {
            include: {
              Supermercado: true,
            },
          },
        },
      },
    },
    orderBy: {
      Producto: {
        nombreProducto: 'asc',
      },
    },
  });
}

export async function GET() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }

  const carrito = await getOrCreateCarrito(usuario.id);
  const items = await findCartItems(carrito.id);

  return NextResponse.json(formatCart(items));
}

export async function DELETE() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const carrito = await getOrCreateCarrito(usuario.id);

  await prisma.carritoItem.deleteMany({
    where: { carritoId: carrito.id },
  });

  return NextResponse.json({ ok: true });
}