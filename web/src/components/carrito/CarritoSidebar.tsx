'use client';

import React from 'react';
import { ResultadoOptimizacion, TotalPorSuper } from '../../utils/cartOptimizer';
import FiltroSupermercados from './FiltroSupermercados';
import SelectorMaxSupers from './SelectorMaxSupers';


type Supermercado = { id: string; nombre: string };

interface CarritoSidebarProps {
  // Supermercados
  supermercados: Supermercado[];
  seleccionados: string[];
  onFiltroChange: (nuevos: string[]) => void;

  // Max supermercados
  maxSupers: number | null;
  onMaxSupersChange: (value: number | null) => void;

  // Optimización
  hayCambios: boolean;
  onOptimizar: () => void;

  // Resultados
  modoMulti: boolean;
  resultadoMulti: ResultadoOptimizacion | null;
  totalesPorSuper: TotalPorSuper[];

  // Desplegables (modo multi)
  supersAbiertos: Set<string>;
  onToggleSuper: (nombre: string) => void;
}

export default function CarritoSidebar({
  supermercados,
  seleccionados,
  onFiltroChange,
  maxSupers,
  onMaxSupersChange,
  hayCambios,
  onOptimizar,
  modoMulti,
  resultadoMulti,
  totalesPorSuper,
  supersAbiertos,
  onToggleSuper,
}: CarritoSidebarProps) {
  const superMasBarato = totalesPorSuper[0];
  const superMasCaro = totalesPorSuper[totalesPorSuper.length - 1];
  const ahorro = superMasCaro && superMasBarato ? superMasCaro.total - superMasBarato.total : 0;

  return (
    <div className="space-y-4">

      {/* FILTRO SUPERMERCADOS */}
      <FiltroSupermercados
        supermercados={supermercados}
        seleccionados={seleccionados}
        onChange={onFiltroChange}
      />

      {/* SELECTOR MAX SUPERMERCADOS */}
      <SelectorMaxSupers
        maxDisponible={seleccionados.length}
        value={maxSupers}
        onChange={onMaxSupersChange}
      />

      {/* BOTÓN OPTIMIZAR */}
      <button
        onClick={onOptimizar}
        disabled={!hayCambios}
        className="w-full py-3 rounded-2xl font-black text-sm transition-all"
        style={{
          fontFamily: "'Oswald', sans-serif",
          backgroundColor: hayCambios ? '#1A237E' : '#E5E7EB',
          color: hayCambios ? 'white' : '#9CA3AF',
          cursor: hayCambios ? 'pointer' : 'default',
        }}
      >
        OPTIMIZAR CARRITO
      </button>

      {/* COMPARATIVA — modo normal */}
      {!modoMulti && (
        <>
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
        </>
      )}

      {/* COMPARATIVA — modo multi-supermercado */}
      {modoMulti && resultadoMulti && (
        <>
          <h2 className="font-black text-gray-800" style={{ fontFamily: "'Oswald', sans-serif" }}>COMPARATIVA</h2>

          {/* Total general */}
          <div className="rounded-2xl p-4 bg-green-50 border border-green-100">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Total optimizado</p>
            <p className="text-2xl font-black text-green-700" style={{ fontFamily: "'Oswald', sans-serif" }}>
              ${resultadoMulti.totalGeneral.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {resultadoMulti.supermercados.length === 1
                ? '1 supermercado'
                : `${resultadoMulti.supermercados.length} supermercados`}
            </p>
          </div>

          {/* Lista de supermercados con desplegable */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {resultadoMulti.supermercados.map((s, i) => {
              const abierto = supersAbiertos.has(s.nombre);
              return (
                <div key={s.nombre} style={{ borderBottom: i < resultadoMulti.supermercados.length - 1 ? '1px solid #F3F4F6' : 'none' }}>

                  {/* Fila clickeable */}
                  <button
                    onClick={() => onToggleSuper(s.nombre)}
                    className="w-full flex justify-between items-center px-4 py-3.5 transition-colors hover:bg-gray-50"
                    style={{ backgroundColor: abierto ? '#F9FAFB' : 'white' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#374151' }}>
                        {s.nombre}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {s.productos.length} {s.productos.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black" style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem' }}>
                        ${s.subtotal.toLocaleString('es-AR')}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 transition-transform"
                        style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Desplegable de productos */}
                  {abierto && (
                    <div style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                      {s.productos.map((prod, j) => (
                        <div key={j} className="flex items-center justify-between px-4 py-2.5"
                          style={{ borderBottom: j < s.productos.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <div className="flex items-center gap-2 min-w-0">
                            {prod.imagen
                              ? <img src={prod.imagen} alt={prod.nombre}
                                  className="w-8 h-8 rounded-lg object-contain bg-white flex-shrink-0 p-0.5 border border-gray-100" />
                              : <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                            }
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">{prod.nombre}</p>
                              <p className="text-[10px] text-gray-400">{prod.cantidad} × ${prod.precio.toLocaleString('es-AR')}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black flex-shrink-0 ml-2" style={{ color: '#1A237E' }}>
                            ${prod.subtotal.toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-300 text-center">* Precio estimado si el producto no está disponible en algún supermercado.</p>
        </>
      )}
    </div>
  );
}