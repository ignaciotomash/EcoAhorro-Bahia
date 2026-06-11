'use client';

import { useUser } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import type { CartItem, ProductoCarrito, CartContextType } from '@/features/carrito/types';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const itemsRef = useRef<CartItem[]>(items);
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const userId = user?.id ?? null;

    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      if (syncedUserRef.current) {
        setItems([]);
        itemsRef.current = [];
      }

      syncedUserRef.current = null;
      setIsLoadingCart(false);
      return;
    }

    if (syncedUserRef.current === userId) {
      setIsLoadingCart(false);
      return;
    }

    if (syncedUserRef.current && syncedUserRef.current !== userId) {
      setItems([]);
      itemsRef.current = [];
    }

    setIsLoadingCart(true);

    let cancelled = false;
    let attempts = 0;

    async function syncCart() {
      try {
        const response = await fetch('/api/carrito');
        if (!response.ok) {
          attempts += 1;

          if (!cancelled && attempts < 5) {
            window.setTimeout(syncCart, 1000);
          } else if (!cancelled) {
            setIsLoadingCart(false);
          }

          return;
        }

        syncedUserRef.current = userId;

        const remoteCart = (await response.json()) as { items?: CartItem[] };
        const localItems = itemsRef.current;
        const mergedItems = new Map<string, CartItem>();

        for (const item of remoteCart.items ?? []) {
          mergedItems.set(item.producto.id, item);
        }

        for (const item of localItems) {
          const existing = mergedItems.get(item.producto.id);
          mergedItems.set(item.producto.id, {
            producto: existing?.producto ?? item.producto,
            cantidad: (existing?.cantidad ?? 0) + item.cantidad,
          });
        }

        const nextItems = Array.from(mergedItems.values());

        if (!cancelled) {
          setItems(nextItems);
        }

        if (localItems.length > 0) {
          await Promise.all(
            nextItems.map(item =>
              fetch(`/api/carrito/items/${encodeURIComponent(item.producto.id)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: item.cantidad }),
              })
            )
          );
        }

        if (!cancelled) {
          setIsLoadingCart(false);
        }
      } catch (error) {
        console.error('No se pudo sincronizar el carrito', error);

        if (!cancelled) {
          setIsLoadingCart(false);
        }
      }
    }

    void syncCart();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user?.id]);

  const persistAdd = async (productoId: string) => {
    if (!isSignedIn) return;

    try {
      await fetch('/api/carrito/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoId }),
      });
    } catch (error) {
      console.error('No se pudo guardar el item del carrito', error);
    }
  };

  const persistQuantity = async (productoId: string, cantidad: number) => {
    if (!isSignedIn) return;

    try {
      await fetch(`/api/carrito/items/${encodeURIComponent(productoId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad }),
      });
    } catch (error) {
      console.error('No se pudo actualizar el item del carrito', error);
    }
  };

  const persistRemove = async (productoId: string) => {
    if (!isSignedIn) return;

    try {
      await fetch(`/api/carrito/items/${encodeURIComponent(productoId)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('No se pudo quitar el item del carrito', error);
    }
  };

  const addToCart = (producto: ProductoCarrito) => {
    setItems(prev => {
      const existing = prev.find(i => i.producto.id === producto.id);
      if (existing) {
        return prev.map(i =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });

    void persistAdd(producto.id);
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.producto.id !== id));
    void persistRemove(id);
  };

  const updateCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.producto.id === id ? { ...i, cantidad } : i))
    );

    void persistQuantity(id, cantidad);
  };

  const clearCart = () => {
    setItems([]);

    if (isSignedIn) {
      void fetch('/api/carrito', { method: 'DELETE' }).catch(error => {
        console.error('No se pudo vaciar el carrito', error);
      });
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, isLoadingCart, addToCart, removeFromCart, updateCantidad, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}