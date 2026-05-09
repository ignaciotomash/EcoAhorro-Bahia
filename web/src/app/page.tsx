'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { PRODUCTOS_MOCK } from '../constants/productos';

export default function HomePage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  const productosFiltrados = PRODUCTOS_MOCK.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoria === 'Todas' || p.categoria === categoria;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <main className="min-h-screen bg-white">

      {/* HERO — navy oscuro, compacto y limpio */}
      <section style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">

          {/* Izquierda: texto */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: 'rgba(255,107,53,0.2)', color: '#FFCBB5' }}>
              🏪 Bahía Blanca · 4 supermercados
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3"
              style={{ fontFamily: "'Oswald', sans-serif" }}>
              COMPARÁ PRECIOS.<br />
              <span style={{ color: '#FF6B35' }}>AHORRÁ MÁS.</span>
            </h1>
            <p className="text-blue-200 text-base mb-6 max-w-md">
              Buscá cualquier producto y mirá cuánto cuesta en cada supermercado de la ciudad.
            </p>

            {/* Buscador */}
            <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-lg max-w-lg">
              <input
                type="text"
                placeholder="Buscar producto..."
                className="flex-1 px-3 py-2.5 rounded-lg outline-none text-gray-700 text-sm bg-transparent"
                onChange={e => setBusqueda(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-lg outline-none text-sm font-medium cursor-pointer bg-gray-50 hidden md:block"
                style={{ color: '#1A237E' }}
                onChange={e => setCategoria(e.target.value)}
              >
                <option value="Todas">Todas</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Almacén">Almacén</option>
                <option value="Panadería">Panadería</option>
              </select>
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: '#FF6B35' }}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Derecha: logo grande */}
          <div className="flex-shrink-0">
            <div className="w-36 h-36 rounded-full bg-white overflow-hidden shadow-2xl"
              style={{ border: '3px solid rgba(255,107,53,0.4)' }}>
              <Image src="/logo.png" alt="Eco Ahorro" width={144} height={144} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-b" style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E7EB' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-6 text-sm text-gray-500 font-medium">
          <span>🏪 <strong className="text-gray-700">4</strong> supermercados</span>
          <span>📦 <strong className="text-gray-700">{PRODUCTOS_MOCK.length}</strong> productos</span>
          <span>🔄 Actualizado hoy</span>
        </div>
      </div>

      {/* ACCESO RÁPIDO AL ESCÁNER */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <Link
          href="/escaner"
          className="flex items-center justify-between p-4 rounded-2xl transition-all hover:shadow-md group"
          style={{ backgroundColor: '#FFF4F0', border: '1.5px solid #FFCBB5' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: '#FF6B35' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3M15 4h2a2 2 0 012 2v3M7 4H5a2 2 0 00-2 2v3" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#1A237E' }}>Escaneá un producto</p>
              <p className="text-xs text-gray-500">Usá la cámara o ingresá el código de barras EAN</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* PRODUCTOS */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black" style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
              PRODUCTOS DESTACADOS
            </h2>
            <p className="text-gray-400 text-sm">Mejores precios actualizados hoy</p>
          </div>
          <Link href="/catalogo" className="text-sm font-semibold hover:underline" style={{ color: '#FF6B35' }}>
            Ver todo →
          </Link>
        </div>

        {productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {productosFiltrados.slice(0, 4).map(prod => (
              <ProductCard key={prod.id} producto={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-300 text-sm">
            No encontramos productos que coincidan.
          </div>
        )}
      </section>
    </main>
  );
}