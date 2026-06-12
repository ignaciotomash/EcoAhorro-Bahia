import type { CartItem } from '@/features/carrito/types';

const API_BASE = '/api/carrito';

export async function fetchCart(): Promise<{ items?: CartItem[] }> {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Error fetching cart');
  return response.json();
}

export async function addItem(productoId: string): Promise<void> {
  await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productoId }),
  });
}

export async function updateItem(productoId: string, cantidad: number): Promise<void> {
  await fetch(`${API_BASE}/items/${encodeURIComponent(productoId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad }),
  });
}

export async function removeItem(productoId: string): Promise<void> {
  await fetch(`${API_BASE}/items/${encodeURIComponent(productoId)}`, { method: 'DELETE' });
}

export async function clearCartRemoto(): Promise<void> {
  await fetch(API_BASE, { method: 'DELETE' });
}

export async function syncItems(items: CartItem[]): Promise<void> {
  await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
      })),
    }),
  });
}
