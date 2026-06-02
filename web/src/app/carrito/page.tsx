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
            const preciosFiltrados = item.producto.precios
              .filter((p: any) => seleccionados.includes(p.super))
              .sort((a: any, b: any) => a.valor - b.valor);
            const precioMasBajo = preciosFiltrados[0] ?? item.producto.precios[0];

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
                    {modoMulti && mapaAsignacion.has(item.producto.id) ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: '#EEF2FF', color: '#1A237E', border: '1px solid #C7D2FE' }}>
                        Comprá en {mapaAsignacion.get(item.producto.id)!.superNombre}: ${mapaAsignacion.get(item.producto.id)!.precio.toLocaleString('es-AR')}
                      </span>
                    ) : (
                      preciosFiltrados.map((p: any, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={i === 0
                            ? { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                            : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                          }>
                          {p.super}: ${p.valor.toLocaleString('es-AR')}
                        </span>
                      ))
                    )}
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

        {/* SIDEBAR */}
        <CarritoSidebar
          supermercados={supermercados}
          seleccionados={seleccionados}
          onFiltroChange={handleFiltroChange}
          maxSupers={maxSupers}
          onMaxSupersChange={handleMaxSupersChange}
          hayCambios={hayCambios}
          onOptimizar={handleOptimizar}
          modoMulti={modoMulti}
          resultadoMulti={resultadoMulti}
          totalesPorSuper={totalesPorSuper}
          supersAbiertos={supersAbiertos}
          onToggleSuper={handleToggleSuper}
        />
      </div>
    </div>
  );
}