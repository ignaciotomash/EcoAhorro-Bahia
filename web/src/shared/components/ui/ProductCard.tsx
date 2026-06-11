'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/features/carrito/context/CartContext';

import { formatearNombreCategoria } from '../../utils/format';

export default function ProductCard({ producto }: { producto: any }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const precioMasBajo = producto.precios?.[0];
  const otrosPrecios = producto.precios?.slice(1) || [];
  const enCarrito = items.find((i: any) => i.producto.id === producto.id);
  const tienePrecionValido = precioMasBajo && precioMasBajo.valor > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tienePrecionValido) return;
    addToCart(producto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl flex flex-col h-full border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden min-w-0">
      <Link href={`/producto/${producto.id}`} className="flex flex-col flex-1">
        {/* IMAGEN */}
        <div className="relative w-full h-32 md:h-48 bg-white p-3 flex items-center justify-center border-b border-gray-50">
          {producto.imagen && !producto.imagen.includes('placehold.co') && producto.imagen !== 'Sin imagen' && !imgError
            ? <img src={producto.imagen} alt={producto.nombre} loading="lazy" decoding="async" className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
            : <div className="w-full h-full flex items-center justify-center bg-gray-50 opacity-70">
                <img src="/logo.png" alt="Sin imagen" className="w-12 h-12 md:w-16 md:h-16 object-contain grayscale opacity-40" />
              </div>
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
              {formatearNombreCategoria(producto.categoria)}
            </span>
          </div>
        </div>

        {/* INFO */}
        <div className="p-3 md:p-4 flex flex-col flex-1 gap-1.5 md:gap-2">
          <div className="flex-1">
            <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">{producto.marca}</p>
            <h3 className="font-bold text-gray-800 leading-snug text-[11px] md:text-sm line-clamp-2 min-h-[32px] md:min-h-[40px]">{producto.nombre}</h3>
            <p className="text-[9px] font-mono text-gray-400 mt-1">EAN: {producto.id}</p>
          </div>

        {/* PRECIOS */}
        <div className="mt-1">
          {precioMasBajo ? (
            <div className="flex flex-col gap-2">
              {/* Mejor precio destacado */}
              <div className="bg-gradient-to-br from-green-50 to-green-25 p-2 md:p-2.5 rounded-lg border border-green-200">
                <div className="flex items-baseline justify-between gap-1.5">
                  <span className="text-lg md:text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    ${precioMasBajo.valor.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] md:text-[10px] mt-1">
                  <span className="text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Mejor
                  </span>
                  <span className="font-bold text-gray-600 truncate">{precioMasBajo.super}</span>
                </div>
              </div>

              {/* Otros precios en comparativa */}
              {otrosPrecios.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-[8px] md:text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Comparativa</p>
                  <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                    {otrosPrecios.map((precio: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[9px] md:text-[10px] bg-gray-50 p-1.5 rounded">
                        <span className="text-gray-600 font-medium truncate flex-1">{precio.super}</span>
                        <span className="font-bold text-gray-700 ml-2">${precio.valor.toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2">
              <span className="text-[10px] md:text-xs text-gray-400 font-medium italic">Precio no disponible</span>
            </div>
          )}
        </div>
        </div>
      </Link>

      {/* BOTÓN */}
      <div className="px-3 md:px-4 pb-3 md:pb-4">
        <button
          onClick={handleAdd}
          disabled={!tienePrecionValido}
          className="w-full py-2 md:py-2.5 rounded-xl text-[10px] md:text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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
              {enCarrito ? `Agregar otro` : 'Agregar al carrito'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}