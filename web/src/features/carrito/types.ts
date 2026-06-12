// ============================================================
// CARRITO — tipos para el estado del carrito (CartContext.tsx)
// ============================================================

export type PrecioItem = {
  super: string;
  valor: number;
};

export type ProductoCarrito = {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  imagen?: string;
  precios: PrecioItem[];
};

export type CartItem = {
  producto: ProductoCarrito;
  cantidad: number;
};

export type CartContextType = {
  items: CartItem[];
  isLoadingCart: boolean;
  addToCart: (producto: ProductoCarrito) => void;
  removeFromCart: (id: string) => void;
  updateCantidad: (id: string, cantidad: number) => void;
  totalItems: number;
  clearCart: () => void;
};

// ============================================================
// OPTIMIZACIÓN — tipos para el optimizador (cartOptimizer.ts)
// ============================================================

export type TotalPorSuper = {
  nombre: string;
  total: number;
};

export type ProductoEnSuper = {
  id: string;
  nombre: string;
  marca: string;
  imagen?: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

export type SupermercadoResultado = {
  nombre: string;
  productos: ProductoEnSuper[];
  subtotal: number;
};

export type ResultadoOptimizacion = {
  supermercados: SupermercadoResultado[];
  totalGeneral: number;
};
