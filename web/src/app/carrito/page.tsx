'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function CarritoPage() {
  const { items, removeFromCart, updateCantidad, clearCart } = useCart();

  const todosLosSupermarketsSet = new Set<string>();
  items.forEach(item => item.producto.precios.forEach(p => todosLosSupermarketsSet.add(p.super)));
  const supermercados = Array.from(todosLosSupermarketsSet).sort();

  const calcularTotalSuper = (superNombre: string) =>
    items.reduce((total, item) => {
      const precio = item.producto.precios.find(p => p.super === superNombre);
      const val = precio ? precio.valor : Math.max(...item.producto.precios.map(p => p.valor));
      return total + val * item.cantidad;
    }, 0);

  const totalesPorSuper = supermercados
    .map(s => ({ nombre: s, total: calcularTotalSuper(s) }))
    .sort((a, b) => a.total - b.total);

  const superMasBarato = totalesPorSuper[0];
  const superMasCaro = totalesPorSuper[totalesPorSuper.length - 1];
  const ahorro = superMasCaro && superMasBarato ? superMasCaro.total - superMasBarato.total : 0;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-4">
        <div className="text-5xl">🛒</div>
        <h1 className="text-2xl font-black" style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
          TU CARRITO ESTÁ VACÍO
        </h1>
        <p className="text-gray-400 text-center text-sm">Agregá productos para comparar precios entre supermercados.</p>
        <Link href="/" className="text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          style={{ backgroundColor: '#1A237E' }}>
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Link href="/" className="text-sm font-medium mb-3 inline-block text-blue-200 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            TU CARRITO
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            {items.reduce((s, i) => s + i.cantidad, 0)} producto(s) seleccionado(s)
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* PRODUCTOS */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-black text-gray-800" style={{ fontFamily: "'Oswald', sans-serif" }}>PRODUCTOS</h2>
            <button onClick={clearCart} className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
              Vaciar carrito
            </button>
          </div>

          {items.map(item => {
            const precioMasBajo = item.producto.precios[0];
            return (
              <div key={item.producto.id} className="bg-white rounded-2xl p-4 flex gap-4 items-start"
                style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                  {item.producto.imagen
                    ? <img src={item.producto.imagen} alt={item.producto.nombre} className="object-contain w-full h-full p-1" />
                    : <span className="text-gray-200 text-xs">—</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{item.producto.categoria}</span>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.producto.nombre}</h3>
                  <p className="text-xs text-gray-400 mb-2">{item.producto.marca}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.producto.precios.map((p: any, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={i === 0
                          ? { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                          : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                        }>
                        {p.super}: ${p.valor.toLocaleString('es-AR')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                  <button onClick={() => removeFromCart(item.producto.id)} className="text-gray-200 hover:text-red-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                    <button onClick={() => updateCantidad(item.producto.id, item.cantidad - 1)}
                      className="w-5 h-5 flex items-center justify-center rounded font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm">−</button>
                    <span className="text-sm font-black w-4 text-center" style={{ color: '#1A237E' }}>{item.cantidad}</span>
                    <button onClick={() => updateCantidad(item.producto.id, item.cantidad + 1)}
                      className="w-5 h-5 flex items-center justify-center rounded font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm">+</button>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Mejor: <span className="font-bold text-green-600">${(precioMasBajo.valor * item.cantidad).toLocaleString('es-AR')}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTALES */}
        <div className="space-y-4">
          <h2 className="font-black text-gray-800" style={{ fontFamily: "'Oswald', sans-serif" }}>COMPARATIVA</h2>

          {ahorro > 0 && (
            <div className="rounded-2xl p-4 bg-green-50 border border-green-100">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Potencial ahorro</p>
              <p className="text-2xl font-black text-green-700" style={{ fontFamily: "'Oswald', sans-serif" }}>
                ${ahorro.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {superMasBarato?.nombre} vs {superMasCaro?.nombre}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {totalesPorSuper.map((s, i) => (
              <div key={s.nombre} className="flex justify-between items-center px-4 py-3.5"
                style={{
                  borderBottom: i < totalesPorSuper.length - 1 ? '1px solid #F3F4F6' : 'none',
                  backgroundColor: i === 0 ? '#f0fdf4' : 'white',
                }}>
                <div className="flex items-center gap-2">
                  {i === 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">MEJOR</span>
                  )}
                  <span className="text-sm font-semibold" style={{ color: i === 0 ? '#15803d' : '#374151' }}>
                    {s.nombre}
                  </span>
                </div>
                <span className="font-black" style={{ color: i === 0 ? '#15803d' : '#1A237E', fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem' }}>
                  ${s.total.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-300 text-center">* Precio estimado si el producto no está disponible en algún supermercado.</p>
        </div>
      </div>
    </div>
  );
}