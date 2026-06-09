'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function HomeClient({ productosLocales, totalProductos, totalSupermercados }: { productosLocales: any[]; totalProductos: number; totalSupermercados: number }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  return (
    <main className="min-h-screen bg-white">

      {/* HERO — navy oscuro, compacto y limpio */}
      <section style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-12 flex flex-col md:flex-row items-center gap-4 md:gap-8">

          {/* Logo — en mobile arriba y más chico */}
          <div className="flex-shrink-0 order-first md:order-last">
            <div className="w-16 h-16 md:w-36 md:h-36 rounded-full bg-white overflow-hidden shadow-2xl"
              style={{ border: '3px solid rgba(255,107,53,0.4)' }}>
              <Image src="/logo.png" alt="Eco Ahorro" width={144} height={144} className="object-cover w-full h-full rounded-full" />
            </div>
          </div>

          {/* Izquierda: texto */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold mb-2 md:mb-4"
              style={{ backgroundColor: 'rgba(255,107,53,0.2)', color: '#FFCBB5' }}>
              🏪 Bahía Blanca · {totalSupermercados} Supermercado{totalSupermercados !== 1 ? 's' : ''}
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-white leading-tight mb-1.5 md:mb-3"
              style={{ fontFamily: "'Oswald', sans-serif" }}>
              COMPARÁ PRECIOS.<br />
              <span style={{ color: '#FF6B35' }}>AHORRÁ MÁS.</span>
            </h1>
            <p className="text-blue-200 text-xs md:text-base mb-3 md:mb-6 max-w-md mx-auto md:mx-0">
              Buscá cualquier producto y mirá cuánto cuesta en cada supermercado.
            </p>

            {/* Buscador */}
            <form 
              className="flex flex-col sm:flex-row gap-1.5 md:gap-2 bg-white p-1 md:p-1.5 rounded-xl shadow-lg max-w-lg mx-auto md:mx-0"
              onSubmit={(e) => {
                e.preventDefault();
                let url = '/catalogo?';
                if (busqueda) url += `search=${encodeURIComponent(busqueda)}&`;
                if (categoria && categoria !== 'Todas') url += `categoria=${encodeURIComponent(categoria)}`;
                window.location.href = url;
              }}
            >
              <input
                type="text"
                placeholder="Buscar producto..."
                className="flex-1 px-3 py-2 md:py-2.5 rounded-lg outline-none text-gray-700 text-xs md:text-sm bg-transparent min-w-0"
                onChange={e => setBusqueda(e.target.value)}
                value={busqueda}
              />
              <div className="flex gap-1.5 md:gap-2">
                <button
                  type="submit"
                  className="px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold text-white transition-all hover:opacity-90 whitespace-nowrap w-full sm:w-auto"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-b" style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E7EB' }}>
        <div className="max-w-5xl mx-auto px-4 py-2 md:py-3 flex flex-wrap gap-x-4 md:gap-x-6 gap-y-0.5 text-[10px] md:text-sm text-gray-500 font-medium">
          <span>🏪 <strong className="text-gray-700">{totalSupermercados}</strong> Supermercados</span>
          <span>📦 <strong className="text-gray-700">{totalProductos}</strong> Productos</span>
          <span>⚡ Precios actualizados</span>
        </div>
      </div>

      {/* ACCESO RÁPIDO AL ESCÁNER */}
      <div className="max-w-5xl mx-auto px-4 pt-4 md:pt-8">
        <Link
          href="/escaner"
          className="flex items-center justify-between p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all hover:shadow-md group"
          style={{ backgroundColor: '#FFF4F0', border: '1.5px solid #FFCBB5' }}
        >
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: '#FF6B35' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3M15 4h2a2 2 0 012 2v3M7 4H5a2 2 0 00-2 2v3" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[11px] md:text-sm" style={{ color: '#1A237E' }}>Escaneá un producto</p>
              <p className="text-[9px] md:text-xs text-gray-500">Usá la cámara o ingresá el código EAN</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* PRODUCTOS */}
      <section className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <div>
            <h2 className="text-base md:text-xl font-black" style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
              PRODUCTOS DESTACADOS
            </h2>
            <p className="text-gray-400 text-[10px] md:text-sm">Mejores precios actualizados hoy</p>
          </div>
          <Link href="/catalogo" className="text-[10px] md:text-sm font-semibold hover:underline" style={{ color: '#FF6B35' }}>
            Ver todo →
          </Link>
        </div>

        {productosLocales.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
            {productosLocales.slice(0, 4).map(prod => (
              <ProductCard key={prod.id} producto={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-300 text-sm">
            No hay productos disponibles.
          </div>
        )}
      </section>
    </main>
  );
}