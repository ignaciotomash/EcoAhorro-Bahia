import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { apiErrorResponse } from '../../../../lib/api-error';
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
  try {
    const usuario = await getCurrentUsuario();

    if (!usuario) {
      return apiErrorResponse(
        'USUARIO_NO_AUTENTICADO',
        'Debes iniciar sesion para agregar productos al carrito.',
        401
      );
    }

    let body: AddItemBody;

    try {
      body = (await request.json()) as AddItemBody;
    } catch {
      return apiErrorResponse(
        'CUERPO_INVALIDO',
        'El cuerpo de la solicitud debe ser un JSON valido.',
        400
      );
    }

    const productoId = body.productoId?.trim();

    if (!productoId) {
      return apiErrorResponse(
        'PRODUCTO_ID_REQUERIDO',
        'El campo productoId es requerido.',
        400
      );
    }

    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
      select: { id: true },
    });

    if (!producto) {
      return apiErrorResponse(
        'PRODUCTO_NO_ENCONTRADO',
        'No se encontro el producto indicado.',
        404,
        `productoId: ${productoId}`
      );
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
  } catch (error) {
    console.error('[carrito-items] Error:', error);

    return apiErrorResponse(
      'ERROR_AGREGANDO_ITEM_CARRITO',
      'No se pudo agregar el producto al carrito.',
      500
    );
  }
}
