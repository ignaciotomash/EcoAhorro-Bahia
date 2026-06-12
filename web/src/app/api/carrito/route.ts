import { NextResponse } from 'next/server';
import { apiErrorResponse } from '@/shared/lib/api-error';
import { getOrCreateCarrito, findCartItems, clearCartItems } from '@/features/carrito/repositories/carritoRepository';
import type { CartItemWithProduct } from '@/features/carrito/repositories/carritoRepository';
import { getCurrentUsuario } from '@/features/auth/services/usuarioService';

function formatCart(items: CartItemWithProduct[]) {
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

    return NextResponse.json(formatCart(items), {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
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
    await clearCartItems(carrito.id);

    return NextResponse.json({ ok: true }, {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('[carrito] Error:', error);

    return apiErrorResponse(
      'ERROR_VACIANDO_CARRITO',
      'No se pudo vaciar el carrito.',
      500
    );
  }
}
