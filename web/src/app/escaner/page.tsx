'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { fetchProductoPorEAN, type ProductoDetalle } from '../../services/productos';
import { useCart } from '../../context/CartContext';

const BarcodeScanner = dynamic(() => import('../../components/BarcodeScanner'), { ssr: false });

const SUPER_LABELS: Record<string, string> = {
  Vea: 'Vea',
  ChangoMas: 'ChangoMás',
  LaBanderita: 'La Banderita',
  LaCoope: 'La Cooperativa',
};

function HistorialChart({ data }: { data: { fecha: string; precioPromedio: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.precioPromedio));
  const min = Math.min(...data.map(d => d.precioPromedio));
  const range = max - min || 1;

  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Historial promedio</p>
      <div className="flex items-end gap-2 h-16">
        {data.map((d, i) => {
          const height = ((d.precioPromedio - min) / range) * 44 + 16;
          const isLast = i === data.length - 1;
          return (
            <div key={d.fecha} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400">${(d.precioPromedio / 1000).toFixed(1)}k</span>
              <div className="w-full rounded-t" style={{ height: `${height}px`, backgroundColor: isLast ? '#1A237E' : '#E5E7EB' }} />
              <span className="text-[8px] text-gray-300">{d.fecha.slice(5)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Estado = 'idle' | 'loading' | 'found' | 'notfound' | 'error';

export default function EscanerPage() {
  const [eanInput, setEanInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [estado, setEstado] = useState<Estado>('idle');
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [added, setAdded] = useState(false);
  const { addToCart, items } = useCart();

  const buscarProducto = useCallback(async (ean: string) => {
    if (!ean.trim()) return;
    setShowScanner(false);
    setEstado('loading');
    setProducto(null);
    try {
      const result = await fetchProductoPorEAN(ean.trim());
      if (result) { setProducto(result); setEstado('found'); }
      else setEstado('notfound');
    } catch { setEstado('error'); }
  }, []);

  const handleScanDetected = useCallback((ean: string) => {
    setEanInput(ean);
    buscarProducto(ean);
  }, [buscarProducto]);

  const handleAddToCart = () => {
    if (!producto) return;
    const preciosOrdenados = producto.preciosPorSuper
      .map(s => ({ super: SUPER_LABELS[s.supermercado] ?? s.supermercado, valor: Math.min(...s.precios.map(p => p.precio)) }))
      .sort((a, b) => a.valor - b.valor);
    addToCart({ id: parseInt(producto.ean.slice(-6)), nombre: producto.nombreProducto, marca: producto.marca, categoria: producto.categoria, imagen: producto.imagen, precios: preciosOrdenados });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const precioMinimo = producto ? Math.min(...producto.preciosPorSuper.flatMap(s => s.precios.map(p => p.precio))) : 0;
  const enCarrito = producto ? items.find(i => i.producto.nombre === producto.nombreProducto) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <p className="text-sm font-medium mb-1" style={{ color: '#FFCBB5' }}>Eco Ahorro Bahía</p>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            BUSCADOR POR CÓDIGO
          </h1>
          <p className="text-blue-200 text-sm mt-1">Ingresá o escaneá el EAN del producto</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* INPUT */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
            Código de barras (EAN)
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              inputMode="numeric"
              value={eanInput}
              onChange={e => setEanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarProducto(eanInput)}
              placeholder="Ej: 7790895000064"
              className="flex-1 px-4 py-2.5 rounded-xl border text-gray-700 outline-none text-sm font-mono bg-gray-50"
              style={{ borderColor: '#E5E7EB' }}
            />
            <button
              onClick={() => buscarProducto(eanInput)}
              disabled={estado === 'loading'}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#1A237E' }}
            >
              {estado === 'loading' ? '...' : 'Buscar'}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-semibold">o</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            onClick={() => setShowScanner(true)}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3M15 4h2a2 2 0 012 2v3M7 4H5a2 2 0 00-2 2v3" />
            </svg>
            Escanear con cámara
          </button>

          <p className="text-[10px] text-gray-300 text-center mt-3">
            Probá:{' '}
            <button onClick={() => { setEanInput('7790895000064'); buscarProducto('7790895000064'); }} className="underline hover:text-gray-500">7790895000064</button>
            {' · '}
            <button onClick={() => { setEanInput('7791813420480'); buscarProducto('7791813420480'); }} className="underline hover:text-gray-500">7791813420480</button>
          </p>
        </div>

        {/* LOADING SKELETON */}
        {estado === 'loading' && (
          <div className="space-y-4 animate-pulse">
            {/* Info del producto skeleton */}
            <div className="bg-white rounded-2xl p-4 flex gap-4 items-start" style={{ border: '1px solid #E5E7EB' }}>
              <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
                <div className="h-5 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
                <div className="h-3 w-28 bg-gray-50 rounded font-mono"></div>
              </div>
            </div>

            {/* Precios por supermercado skeleton */}
            <div>
              <div className="h-3 w-40 bg-gray-100 rounded mb-3"></div>
              <div className="space-y-2.5">
                {/* Mejor precio row skeleton */}
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-green-100/50">
                  <div className="px-4 py-3 flex justify-between items-center bg-green-50/20">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-12 bg-green-200/50 rounded"></div>
                      <div className="h-4 w-24 bg-green-200/30 rounded"></div>
                    </div>
                    <div className="h-5 w-24 bg-green-200/40 rounded"></div>
                  </div>
                </div>
                {/* Other prices rows skeletons */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-4 py-3 flex justify-between items-center bg-gray-50/50">
                      <div className="h-4 w-28 bg-gray-200/60 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200/40 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial skeleton */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
              <div className="h-3 w-32 bg-gray-100 rounded"></div>
              <div className="flex items-end gap-2 h-16 pt-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-gray-100 rounded-t" style={{ height: `${20 + i * 8}px` }}></div>
                    <div className="h-2 w-6 bg-gray-50 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón skeleton */}
            <div className="h-14 w-full bg-gray-100 rounded-2xl"></div>
          </div>
        )}

        {/* NOT FOUND */}
        {estado === 'notfound' && (
          <div className="text-center py-10 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-bold text-gray-700 text-sm">Producto no encontrado</p>
            <p className="text-xs text-gray-400 mt-1">EAN <span className="font-mono">{eanInput}</span> no está en la base de datos.</p>
          </div>
        )}

        {/* ERROR */}
        {estado === 'error' && (
          <div className="text-center py-10 rounded-2xl bg-red-50 border border-red-100">
            <p className="font-bold text-red-600 text-sm">Error al conectar</p>
            <p className="text-xs text-red-400 mt-1">Verificá tu conexión e intentá nuevamente.</p>
          </div>
        )}

        {/* RESULTADO */}
        {estado === 'found' && producto && (
          <div className="space-y-4">

            {/* Info del producto */}
            <div className="bg-white rounded-2xl p-4 flex gap-4 items-start" style={{ border: '1px solid #E5E7EB' }}>
              <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                {producto.imagen
                  ? <img src={producto.imagen} alt={producto.nombreProducto} className="object-contain w-full h-full p-1" />
                  : <span className="text-gray-200 text-xs">—</span>
                }
              </div>
              <div className="flex-1">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{producto.categoria}</span>
                <h2 className="text-xl font-black leading-tight" style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
                  {producto.nombreProducto}
                </h2>
                <p className="text-sm text-gray-400">{producto.marca}</p>
                <p className="text-[10px] font-mono text-gray-300 mt-0.5">EAN: {producto.ean}</p>
              </div>
            </div>

            {/* Precios por supermercado */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Precios por supermercado</p>
              <div className="space-y-2.5">
                {[...producto.preciosPorSuper]
                  .sort((a, b) => Math.min(...a.precios.map(p => p.precio)) - Math.min(...b.precios.map(p => p.precio)))
                  .map(superItem => {
                    const precioMin = Math.min(...superItem.precios.map(p => p.precio));
                    const esMejor = precioMin === precioMinimo;
                    return (
                      <div key={superItem.supermercado} className="bg-white rounded-2xl overflow-hidden"
                        style={{ border: esMejor ? '2px solid #16a34a' : '1px solid #E5E7EB' }}>
                        <div className="px-4 py-3 flex justify-between items-center"
                          style={{ backgroundColor: esMejor ? '#f0fdf4' : '#FAFAFA' }}>
                          <div className="flex items-center gap-2">
                            {esMejor && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">MEJOR</span>}
                            <span className="font-bold text-sm" style={{ color: esMejor ? '#15803d' : '#1A237E' }}>
                              {SUPER_LABELS[superItem.supermercado] ?? superItem.supermercado}
                            </span>
                          </div>
                          <span className="font-black text-lg" style={{ color: esMejor ? '#15803d' : '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
                            desde ${precioMin.toLocaleString('es-AR')}
                          </span>
                        </div>
                        {superItem.precios.length > 1 && (
                          <div className="px-4 pb-3 pt-1 space-y-1">
                            {superItem.precios.map(ps => (
                              <div key={ps.sucursal.idSucursal} className="flex justify-between items-center text-xs">
                                <a href={ps.sucursal.ubicacionMaps} target="_blank" rel="noopener noreferrer"
                                  className="text-gray-400 hover:underline flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {ps.sucursal.nombre}
                                </a>
                                <span className="font-semibold text-gray-600">${ps.precio.toLocaleString('es-AR')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {superItem.precios.length === 1 && (
                          <div className="px-4 pb-2.5">
                            <a href={superItem.precios[0].sucursal.ubicacionMaps} target="_blank" rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#FF6B35' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              Ver en Maps
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Historial */}
            {producto.historialPrecios.length > 0 && (
              <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E5E7EB' }}>
                <HistorialChart data={producto.historialPrecios} />
              </div>
            )}

            {/* Añadir al carrito */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                backgroundColor: added ? '#16a34a' : '#1A237E',
                transform: added ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {added ? '✓ ¡Añadido al carrito!' : enCarrito ? `Añadir otro (${enCarrito.cantidad} en carrito)` : 'Añadir al carrito'}
            </button>
          </div>
        )}
      </div>

      {showScanner && <BarcodeScanner onDetected={handleScanDetected} onClose={() => setShowScanner(false)} />}
    </div>
  );
}