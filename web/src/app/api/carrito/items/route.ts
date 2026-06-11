import { NextResponse } from 'next/server';
import { apiErrorResponse } from '@/shared/lib/api-error';
import { getOrCreateCarrito, upsertCartItem, findProductoById } from '@/features/carrito/repositories/carritoRepository';
import { getCurrentUsuario } from '@/features/auth/services/usuarioService';

type AddItemBody = {
  productoId?: string;
};

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

    const producto = await findProductoById(productoId);

    if (!producto) {
      return apiErrorResponse(
        'PRODUCTO_NO_ENCONTRADO',
        'No se encontro el producto indicado.',
        404,
        `productoId: ${productoId}`
      );
    }

    const carrito = await getOrCreateCarrito(usuario.id);

    const item = await upsertCartItem(carrito.id, productoId, 1);

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
