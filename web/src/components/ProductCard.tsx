'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ producto }: { producto: any }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const precioMasBajo = producto.precios[0];
  const otrosPrecios = producto.precios.slice(1);
  const enCarrito = items.find(i => i.producto.id === producto.id);

  const handleAdd = () => {
    addToCart(producto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="rounded-2xl bg-white flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

      {/* IMAGEN */}
      <div className="relative w-full h-44 rounded-t-2xl overflow-hidden flex items-center justify-center bg-gray-50">
        {producto.imagen
          ? <img src={producto.imagen} alt={producto.nombre} className="object-contain w-full h-full p-3 hover:scale-105 transition-transform duration-300" />
          : <span className="text-gray-300 text-xs">Sin imagen</span>
        }
        {enCarrito && (
          <div className="absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#1A237E' }}>
            ×{enCarrito.cantidad}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white text-gray-500 border border-gray-100">
            {producto.categoria}
          </span>
        </div>
      </div>

      {/* INFO */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 leading-tight text-sm mb-0.5">{producto.nombre}</h3>
        <p className="text-xs text-gray-400 mb-3">{producto.marca}</p>

        {/* MEJOR PRECIO — verde */}
        <div className="rounded-xl p-3 mb-3 bg-green-50 border border-green-100">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Mejor precio</span>
            <span className="text-[10px] font-semibold text-green-600 bg-white px-1.5 py-0.5 rounded-full border border-green-100">
              {precioMasBajo.super}
            </span>
          </div>
          <div className="text-2xl font-black text-green-700" style={{ fontFamily: "'Oswald', sans-serif" }}>
            ${precioMasBajo.valor.toLocaleString('es-AR')}
          </div>
        </div>

        {/* COMPARATIVA */}
        <div className="flex-1 space-y-1.5 mb-4">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-1">Comparativa</p>
          {otrosPrecios.map((p: any, i: number) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{p.super}</span>
              <span className="text-xs font-bold text-gray-700">${p.valor.toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>

        {/* BOTÓN */}
        <button
          onClick={handleAdd}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
          style={{
            backgroundColor: added ? '#16a34a' : '#1A237E',
            transform: added ? 'scale(0.97)' : 'scale(1)',
          }}
        >
          {added ? '✓ Añadido' : enCarrito ? `Añadir otro (${enCarrito.cantidad})` : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  );
}