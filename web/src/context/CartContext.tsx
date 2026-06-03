'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PrecioItem = {
  super: string;
  valor: number;
};

export type Producto = {
  id: number;
  nombre: string;
  marca: string;
  categoria: string;
  imagen?: string;
  precios: PrecioItem[];
};

export type CartItem = {
  producto: Producto;
  cantidad: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (producto: Producto) => void;
  removeFromCart: (id: number) => void;
  updateCantidad: (id: number, cantidad: number) => void;
  totalItems: number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (producto: Producto) => {
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
  };

  const removeFromCart = (id: number) => {
    setItems(prev => prev.filter(i => i.producto.id !== id));
  };

  const updateCantidad = (id: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.producto.id === id ? { ...i, cantidad } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateCantidad, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
