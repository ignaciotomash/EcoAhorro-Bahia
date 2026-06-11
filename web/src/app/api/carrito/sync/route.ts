import { NextResponse } from 'next/server';
import { apiErrorResponse } from '@/shared/lib/api-error';
import { getOrCreateCarrito, syncCartItems } from '@/features/carrito/repositories/carritoRepository';
import { getCurrentUsuario } from '@/features/auth/services/usuarioService';

type SyncBody = {
  items: { productoId: string; cantidad: number }[];
};

export async function POST(request: Request) {
  try {
    const usuario = await getCurrentUsuario();

    if (!usuario) {
      return apiErrorResponse(
        'USUARIO_NO_AUTENTICADO',
        'Debes iniciar sesion para sincronizar el carrito.',
        401
      );
    }

    let body: SyncBody;

    try {
      body = (await request.json()) as SyncBody;
    } catch {
      return apiErrorResponse(
        'CUERPO_INVALIDO',
        'El cuerpo de la solicitud debe ser un JSON valido.',
        400
      );
    }

    if (!Array.isArray(body.items)) {
      return apiErrorResponse(
        'CUERPO_INVALIDO',
        'El campo items debe ser un array valido.',
        400
      );
    }

    const carrito = await getOrCreateCarrito(usuario.id);
    await syncCartItems(carrito.id, body.items);

    return NextResponse.json({ ok: true }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('[carrito-sync] Error:', error);

    return apiErrorResponse(
      'ERROR_SINCRONIZANDO_CARRITO',
      'No se pudo sincronizar el carrito.',
      500
    );
  }
}
