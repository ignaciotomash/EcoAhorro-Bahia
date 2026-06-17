'use client';

import React, { useState } from 'react';
import type { TotalPorSuper } from '@/features/carrito/types';
import DesplegableFaltantes from './DesplegableFaltantes';

type Props = {
  totalesPorSuper: TotalPorSuper[];
  huboFallback: boolean;
};

export default function ComparativaNormal({ totalesPorSuper, huboFallback }: Props) {
  const [faltantesAbiertos, setFaltantesAbiertos] = useState<Set<string>>(new Set());

  const toggleFaltantes = (nombre: string) => {
    setFaltantesAbiertos(prev => {
      const next = new Set(prev);
      next.has(nombre) ? next.delete(nombre) : next.add(nombre);
      return next;
    });
  };

  const superMasBarato = totalesPorSuper[0];
  const superMasCaro = totalesPorSuper[totalesPorSuper.length - 1];
  const ahorro = !huboFallback && superMasCaro && superMasBarato
    ? superMasCaro.total - superMasBarato.total
    : 0;

  return (
    <>
      <h2 className="font-black text-gray-800" style={{ fontFamily: "'Oswald', sans-serif" }}>COMPARATIVA</h2>

      {huboFallback && (
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100">
          <p className="text-xs font-semibold text-amber-700">
            Ningún supermercado tiene todos los productos del carrito. Mostrando las opciones con más productos disponibles.
          </p>
        </div>
      )}

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
        {totalesPorSuper.map((s, i) => {
          const abierto = faltantesAbiertos.has(s.nombre);
          const esPrimero = i === 0;
          const etiqueta = huboFallback
            ? (esPrimero ? 'MÁS PRODUCTOS' : null)
            : (esPrimero ? 'MEJOR' : null);

          return (
            <div key={s.nombre}
              style={{
                borderBottom: i < totalesPorSuper.length - 1 ? '1px solid #F3F4F6' : 'none',
                backgroundColor: esPrimero ? '#f0fdf4' : 'white',
              }}>
              <div className="flex justify-between items-center px-4 py-3.5">
                <div className="flex items-center gap-2 min-w-0">
                  {etiqueta && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white flex-shrink-0">{etiqueta}</span>
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-semibold block truncate" style={{ color: esPrimero ? '#15803d' : '#374151' }}>
                      {s.nombre}
                    </span>
                    {s.faltantes.length > 0 ? (
                      <button
                        onClick={() => toggleFaltantes(s.nombre)}
                        className="flex items-center gap-1 text-[10px] text-amber-600 font-medium hover:text-amber-700 transition-colors"
                      >
                        Faltan {s.faltantes.length} {s.faltantes.length === 1 ? 'producto' : 'productos'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 transition-transform"
                          style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-[10px] text-green-600 font-medium">Todos disponibles</span>
                    )}
                  </div>
                </div>
                <span className="font-black flex-shrink-0 ml-2" style={{ color: esPrimero ? '#15803d' : '#1A237E', fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem' }}>
                  ${s.total.toLocaleString('es-AR')}
                </span>
              </div>

              {abierto && s.faltantes.length > 0 && (
                <DesplegableFaltantes faltantes={s.faltantes} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 text-center">* Precio estimado si el producto no está disponible en algún supermercado.</p>
    </>
  );
}