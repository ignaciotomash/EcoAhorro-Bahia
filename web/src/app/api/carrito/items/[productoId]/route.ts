import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { apiErrorResponse } from '@/shared/lib/api-error';
import { prisma } from '@/shared/lib/prisma';
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
  try {
    const usuario = await getCurrentUsuario();

    if (!usuario) {
      return apiErrorResponse(
        'USUARIO_NO_AUTENTICADO',
        'Debes iniciar sesion para modificar el carrito.',
        401
      );
    }

    const { productoId } = await context.params;
    let body: UpdateItemBody;

    try {
      body = (await request.json()) as UpdateItemBody;
    } catch {
      return apiErrorResponse(
        'CUERPO_INVALIDO',
        'El cuerpo de la solicitud debe ser un JSON valido.',
        400
      );
    }

    const cantidad = Number(body.cantidad);

    if (!Number.isInteger(cantidad)) {
      return apiErrorResponse(
        'CANTIDAD_INVALIDA',
        'El campo cantidad debe ser un entero.',
        400,
        `cantidad: ${body.cantidad}`
      );
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
      return apiErrorResponse(
        'PRODUCTO_NO_ENCONTRADO',
        'No se encontro el producto indicado.',
        404,
        `productoId: ${productoId}`
      );
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
  } catch (error) {
    console.error('[carrito-item] Error:', error);

    return apiErrorResponse(
      'ERROR_ACTUALIZANDO_ITEM_CARRITO',
      'No se pudo actualizar el producto del carrito.',
      500
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const usuario = await getCurrentUsuario();

    if (!usuario) {
      return apiErrorResponse(
        'USUARIO_NO_AUTENTICADO',
        'Debes iniciar sesion para quitar productos del carrito.',
        401
      );
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
  } catch (error) {
    console.error('[carrito-item] Error:', error);

    return apiErrorResponse(
      'ERROR_ELIMINANDO_ITEM_CARRITO',
      'No se pudo quitar el producto del carrito.',
      500
    );
  }
}
