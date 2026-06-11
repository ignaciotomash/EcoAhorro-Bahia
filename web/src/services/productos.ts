import type { ProductoDetalleEan } from '@/features/productos/types';

export async function fetchProductoPorEAN(
  ean: string
): Promise<ProductoDetalleEan | null> {

  const response =
    await fetch(
      `/api/productos/${ean}`,
      {
        next: { revalidate: 3600 },
      }
    );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      'Error buscando producto'
    );
  }

  return response.json();
}
