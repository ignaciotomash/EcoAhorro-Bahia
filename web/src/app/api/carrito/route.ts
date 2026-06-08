import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { apiErrorResponse } from '../../../lib/api-error';
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
  try {
    const usuario = await getCurrentUsuario();

    if (!usuario) {
      return apiErrorResponse(
        'USUARIO_NO_AUTENTICADO',
        'Debes iniciar sesion para consultar el carrito.',
        401
      );
    }

    const carrito = await getOrCreateCarrito(usuario.id);
    const items = await findCartItems(carrito.id);

    return NextResponse.json(formatCart(items));
  } catch (error) {
    console.error('[carrito] Error:', error);

    return apiErrorResponse(
      'ERROR_OBTENIENDO_CARRITO',
      'No se pudo obtener el carrito.',
      500
    );
  }
}

export async function DELETE() {
  try {
    const usuario = await getCurrentUsuario();

    if (!usuario) {
      return apiErrorResponse(
        'USUARIO_NO_AUTENTICADO',
        'Debes iniciar sesion para vaciar el carrito.',
        401
      );
    }

    const carrito = await getOrCreateCarrito(usuario.id);

    await prisma.carritoItem.deleteMany({
      where: { carritoId: carrito.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[carrito] Error:', error);

    return apiErrorResponse(
      'ERROR_VACIANDO_CARRITO',
      'No se pudo vaciar el carrito.',
      500
    );
  }
}
