'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { fetchSupermercados, Supermercado } from '../../services/api';
import { calcularTotalesPorSuper, optimizarCarrito, ResultadoOptimizacion } from '../../utils/cartOptimizer';
import CarritoSidebar from '../../components/carrito/CarritoSidebar';

export default function CarritoPage() {
  const { items, removeFromCart, updateCantidad, clearCart } = useCart();

  // ── Supermercados ──────────────────────────────────────────
  const [supermercados, setSupermercados] = useState<Supermercado[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [aplicados, setAplicados] = useState<string[]>([]);

  // ── Max supermercados ──────────────────────────────────────
  const [maxSupers, setMaxSupers] = useState<number | null>(null);
  const [maxSupersAplicado, setMaxSupersAplicado] = useState<number | null>(null);

  // ── Cambios pendientes ─────────────────────────────────────
  const [hayCambios, setHayCambios] = useState(false);

  // ── Desplegables de productos por super ───────────────────
  const [supersAbiertos, setSupersAbiertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSupermercados().then(data => {
      setSupermercados(data);
      const nombres = data.map(s => s.nombre);
      setSeleccionados(nombres);
      setAplicados(nombres);
    });
  }, []);

  const detectarCambios = (nuevosSeleccionados: string[], nuevoMax: number | null) => {
    const seleccionadosCambiaron =
      nuevosSeleccionados.length !== aplicados.length ||
      nuevosSeleccionados.some(s => !aplicados.includes(s));
    const maxCambio = nuevoMax !== maxSupersAplicado;
    setHayCambios(seleccionadosCambiaron || maxCambio);
  };

  const handleFiltroChange = (nuevos: string[]) => {
    setSeleccionados(nuevos);
    detectarCambios(nuevos, maxSupers);
  };

  const handleMaxSupersChange = (value: number | null) => {
    setMaxSupers(value);
    detectarCambios(seleccionados, value);
  };

  const handleOptimizar = () => {
    setAplicados(seleccionados);
    setMaxSupersAplicado(maxSupers);
    setHayCambios(false);
    setSupersAbiertos(new Set());
  };

  const handleToggleSuper = (nombre: string) => {
    setSupersAbiertos(prev => {
      const next = new Set(prev);
      next.has(nombre) ? next.delete(nombre) : next.add(nombre);
      return next;
    });
  };

  // ── Cálculo ────────────────────────────────────────────────
  const modoMulti = maxSupersAplicado !== null;

  const resultadoMulti: ResultadoOptimizacion | null = modoMulti
    ? optimizarCarrito(items, aplicados, maxSupersAplicado)
    : null;

  const mapaAsignacion = new Map<number, { superNombre: string; precio: number }>();
  if (modoMulti && resultadoMulti) {
    resultadoMulti.supermercados.forEach(s => {
      s.productos.forEach(prod => {
        mapaAsignacion.set(prod.id, { superNombre: s.nombre, precio: prod.precio });
      });
    });
  }

  const totalesPorSuper = !modoMulti ? calcularTotalesPorSuper(items, aplicados) : [];

  // ── Carrito vacío ──────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 md:gap-5 px-4">
        <div className="text-4xl md:text-5xl">🛒</div>
        <h1 className="text-xl md:text-2xl font-black text-center" style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
          TU CARRITO ESTÁ VACÍO
        </h1>
        <p className="text-gray-400 text-center text-xs md:text-sm">Agregá productos para comparar precios entre supermercados.</p>
        <Link href="/" className="text-white px-5 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm hover:opacity-90 transition-all"
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
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
          <Link href="/" className="text-xs md:text-sm font-medium mb-2 md:mb-3 inline-block text-blue-200 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            TU CARRITO
          </h1>
          <p className="text-blue-200 text-xs md:text-sm mt-1">
            {items.reduce((s, i) => s + i.cantidad, 0)} producto(s) seleccionado(s)
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* PRODUCTOS */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-black text-gray-800 text-sm md:text-base" style={{ fontFamily: "'Oswald', sans-serif" }}>PRODUCTOS</h2>
            <button onClick={clearCart} className="text-[10px] md:text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
              Vaciar carrito
            </button>
          </div>

          {items.map(item => {
            const preciosFiltrados = item.producto.precios
              .filter((p: any) => seleccionados.includes(p.super))
              .sort((a: any, b: any) => a.valor - b.valor);
            const precioMasBajo = preciosFiltrados[0] ?? item.producto.precios[0];

            return (
              <div key={item.producto.id} className="bg-white rounded-2xl p-3 md:p-4"
                style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {/* Top row: image + info */}
                <div className="flex gap-3 md:gap-4 items-start">
                  <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                    {item.producto.imagen
                      ? <img src={item.producto.imagen} alt={item.producto.nombre} className="object-contain w-full h-full p-1" />
                      : <span className="text-gray-200 text-xs">—</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] md:text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{item.producto.categoria}</span>
                    <h3 className="font-bold text-gray-900 text-xs md:text-sm leading-tight truncate">{item.producto.nombre}</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 mb-1.5 md:mb-2">{item.producto.marca}</p>
                    
                    {/* Precios - wraps on mobile */}
                    <div className="flex flex-wrap gap-1 md:gap-1.5">
                      {item.producto.precios.map((p: any, i: number) => (
                        <span key={i} className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full font-semibold"
                          style={i === 0
                            ? { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                            : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                          }>
                          {p.super}: ${p.valor.toLocaleString('es-AR')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Remove button - always visible */}
                  <button onClick={() => removeFromCart(item.producto.id)} className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Bottom row: quantity + best price */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                    <button onClick={() => updateCantidad(item.producto.id, item.cantidad - 1)}
                      className="w-5 h-5 flex items-center justify-center rounded font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm">−</button>
                    <span className="text-xs md:text-sm font-black w-4 text-center" style={{ color: '#1A237E' }}>{item.cantidad}</span>
                    <button onClick={() => updateCantidad(item.producto.id, item.cantidad + 1)}
                      className="w-5 h-5 flex items-center justify-center rounded font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm">+</button>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-400">
                    Mejor: <span className="font-bold text-green-600">${(precioMasBajo.valor * item.cantidad).toLocaleString('es-AR')}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTALES */}
        <div className="space-y-4">
          <h2 className="font-black text-gray-800 text-sm md:text-base" style={{ fontFamily: "'Oswald', sans-serif" }}>COMPARATIVA</h2>

          {ahorro > 0 && (
            <div className="rounded-2xl p-3 md:p-4 bg-green-50 border border-green-100">
              <p className="text-[9px] md:text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Potencial ahorro</p>
              <p className="text-xl md:text-2xl font-black text-green-700" style={{ fontFamily: "'Oswald', sans-serif" }}>
                ${ahorro.toLocaleString('es-AR')}
              </p>
              <p className="text-[10px] md:text-xs text-green-600 mt-1">
                {superMasBarato?.nombre} vs {superMasCaro?.nombre}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {totalesPorSuper.map((s, i) => (
              <div key={s.nombre} className="flex justify-between items-center px-3 md:px-4 py-3 md:py-3.5"
                style={{
                  borderBottom: i < totalesPorSuper.length - 1 ? '1px solid #F3F4F6' : 'none',
                  backgroundColor: i === 0 ? '#f0fdf4' : 'white',
                }}>
                <div className="flex items-center gap-1.5 md:gap-2">
                  {i === 0 && (
                    <span className="text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">MEJOR</span>
                  )}
                  <span className="text-xs md:text-sm font-semibold" style={{ color: i === 0 ? '#15803d' : '#374151' }}>
                    {s.nombre}
                  </span>
                </div>
                <span className="font-black text-[0.95rem] md:text-lg" style={{ color: i === 0 ? '#15803d' : '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
                  ${s.total.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[9px] md:text-[10px] text-gray-300 text-center">* Precio estimado si el producto no está disponible en algún supermercado.</p>
        </div>
      </div>
    </div>
  );
}