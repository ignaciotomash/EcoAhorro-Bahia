'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ producto }: { producto: any }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const precioMasBajo = producto.precios?.[0];
  const otrosPrecios = producto.precios?.slice(1) || [];
  const enCarrito = items.find((i: any) => i.producto.id === producto.id);
  const tienePrecionValido = precioMasBajo && precioMasBajo.valor > 0;

  const handleAdd = () => {
    if (!tienePrecionValido) return;
    addToCart(producto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl flex flex-col h-full border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden min-w-0">

      {/* IMAGEN */}
      <div className="relative w-full h-32 md:h-48 bg-white p-3 flex items-center justify-center border-b border-gray-50">
        {producto.imagen && producto.imagen !== 'https://placehold.co/400x400/f3f4f6/6b7280?text=Sin+Imagen'
          ? <img src={producto.imagen} alt={producto.nombre} loading="lazy" decoding="async" className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
          : <span className="text-gray-300 text-[10px] md:text-xs font-medium">Sin foto</span>
        }
        
        {/* Badge cantidad carrito */}
        {enCarrito && (
          <div className="absolute top-2 right-2 text-white text-[10px] md:text-xs font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full shadow-md z-10"
            style={{ backgroundColor: '#FF6B35' }}>
            {enCarrito.cantidad}
          </div>
        )}
        
        {/* Categoría floting */}
        <div className="absolute bottom-2 left-2 max-w-[80%]">
          <span className="inline-block truncate text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-900/5 text-gray-600 backdrop-blur-sm">
            {producto.categoria}
          </span>
        </div>
      </div>

      {/* INFO */}
      <div className="p-3 md:p-4 flex flex-col flex-1 gap-1.5 md:gap-2">
        <div className="flex-1">
          <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">{producto.marca}</p>
          <h3 className="font-bold text-gray-800 leading-snug text-[11px] md:text-sm line-clamp-2 min-h-[32px] md:min-h-[40px]">{producto.nombre}</h3>
        </div>

        {/* PRECIOS */}
        <div className="mt-1">
          {precioMasBajo ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg md:text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  ${precioMasBajo.valor.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] md:text-[11px]">
                <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Mejor en
                </span>
                <span className="font-bold text-gray-600 truncate max-w-[80px] md:max-w-[100px]">{precioMasBajo.super}</span>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <span className="text-[10px] md:text-xs text-gray-400 font-medium italic">Precio no disponible</span>
            </div>
          )}
        </div>

        {/* COMPARATIVA MOBILE / DESKTOP */}
        {otrosPrecios.length > 0 && (
          <div className="mt-1 md:mt-2 pt-2 md:pt-3 border-t border-gray-100">
            {/* Solo mostramos la tienda con el 2do mejor precio en celular para no agobiar */}
            <div className="flex justify-between items-center text-[9px] md:text-[11px]">
              <span className="text-gray-500 truncate mr-2">{otrosPrecios[0].super}</span>
              <span className="font-semibold text-gray-400 line-through decoration-gray-300 decoration-1">${otrosPrecios[0].valor.toLocaleString('es-AR')}</span>
            </div>
            {otrosPrecios.length > 1 && (
              <p className="text-[8px] md:text-[10px] text-gray-400 mt-1 text-center font-medium">
                y {otrosPrecios.length - 1} más...
              </p>
            )}
          </div>
        )}

        {/* BOTÓN */}
        <button
          onClick={handleAdd}
          disabled={!tienePrecionValido}
          className="mt-2 w-full py-2 md:py-2.5 rounded-xl text-[10px] md:text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: !tienePrecionValido ? '#F3F4F6' : (added ? '#10B981' : '#1A237E'),
            color: !tienePrecionValido ? '#9CA3AF' : '#FFFFFF',
            transform: added ? 'scale(0.97)' : 'scale(1)',
          }}
        >
          {!tienePrecionValido ? (
            'Agotado'
          ) : added ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ¡Agregado!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {enCarrito ? `Agregar otro` : 'Lo quiero'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}