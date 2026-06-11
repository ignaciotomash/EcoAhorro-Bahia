'use client';

import { useUser } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import type { CartItem, ProductoCarrito, CartContextType } from '@/features/carrito/types';
import * as api from '@/features/carrito/services/cartApiClient';

const CartContext = createContext<CartContextType | null>(null);

function mergeCartItems(remote: CartItem[], local: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of remote) {
    merged.set(item.producto.id, item);
  }

  for (const item of local) {
    const existing = merged.get(item.producto.id);
    merged.set(item.producto.id, {
      producto: existing?.producto ?? item.producto,
      cantidad: (existing?.cantidad ?? 0) + item.cantidad,
    });
  }

  return Array.from(merged.values());
}

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
        const response = await api.fetchCart();
        syncedUserRef.current = userId;

        const localItems = itemsRef.current;
        const nextItems = mergeCartItems(response.items ?? [], localItems);

        if (!cancelled) {
          setItems(nextItems);
        }

        if (localItems.length > 0) {
          await api.syncItems(nextItems);
        }

        if (!cancelled) {
          setIsLoadingCart(false);
        }
      } catch (error) {
        attempts += 1;
        if (!cancelled && attempts < 5) {
          window.setTimeout(syncCart, 1000);
        } else if (!cancelled) {
          setIsLoadingCart(false);
        }
      }
    }

    void syncCart();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user?.id]);

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

    if (isSignedIn) {
      void api.addItem(producto.id);
    }
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.producto.id !== id));
    if (isSignedIn) {
      void api.removeItem(id);
    }
  };

  const updateCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.producto.id === id ? { ...i, cantidad } : i))
    );
    if (isSignedIn) {
      void api.updateItem(id, cantidad);
    }
  };

  const clearCart = () => {
    setItems([]);
    if (isSignedIn) {
      void api.clearCartRemoto();
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
