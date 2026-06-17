'use client';

import React, { useState } from 'react';
import type { ResultadoOptimizacion } from '@/features/carrito/types';
import DesplegableProductos from './DesplegableProductos';
import DesplegableFaltantes from './DesplegableFaltantes';

type Props = {
  resultadoMulti: ResultadoOptimizacion;
  huboFallback: boolean;
  supersAbiertos: Set<string>;
  onToggleSuper: (nombre: string) => void;
};

export default function ComparativaMulti({
  resultadoMulti,
  huboFallback,
  supersAbiertos,
  onToggleSuper,
}: Props) {
  const [faltantesAbierto, setFaltantesAbierto] = useState(false);

  return (
    <>
      <h2 className="font-black text-gray-800" style={{ fontFamily: "'Oswald', sans-serif" }}>COMPARATIVA</h2>

      {huboFallback && (
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100">
          <p className="text-xs font-semibold text-amber-700">
            No hay una combinación con ese límite de supermercados que cubra todos los productos. Mostrando la opción con más productos disponibles.
          </p>
        </div>
      )}

      {/* Total general */}
      <div className="rounded-2xl p-4 bg-green-50 border border-green-100">
        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">
          {huboFallback ? 'Total estimado' : 'Total optimizado'}
        </p>
        <p className="text-2xl font-black text-green-700" style={{ fontFamily: "'Oswald', sans-serif" }}>
          ${resultadoMulti.totalGeneral.toLocaleString('es-AR')}
        </p>
        <p className="text-xs text-green-600 mt-1">
          {resultadoMulti.supermercados.length === 1
            ? '1 supermercado'
            : `${resultadoMulti.supermercados.length} supermercados`}
        </p>
      </div>

      {/* Lista de supermercados con desplegable de productos a comprar */}
      <div className="bg-white rounded-2xl overflow-visible" style={{ border: '1px solid #E5E7EB' }}>
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

              {/* Desplegable de productos a comprar en este super */}
              {abierto && <DesplegableProductos productos={s.productos} />}
            </div>
          );
        })}

        {/* Bloque de productos faltantes, fuera de cualquier supermercado */}
        {resultadoMulti.faltantes.length > 0 && (
          <div style={{ borderTop: '1px solid #F3F4F6' }}>
            <button
              onClick={() => setFaltantesAbierto(prev => !prev)}
              className="w-full flex justify-between items-center px-4 py-3.5 transition-colors hover:bg-amber-50"
              style={{ backgroundColor: faltantesAbierto ? '#FFFBEB' : 'white' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">⚠</span>
                <span className="text-sm font-semibold text-amber-700">
                  Productos no disponibles
                </span>
                <span className="text-[10px] text-amber-500">
                  {resultadoMulti.faltantes.length} {resultadoMulti.faltantes.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400 transition-transform"
                style={{ transform: faltantesAbierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {faltantesAbierto && <DesplegableFaltantes faltantes={resultadoMulti.faltantes} />}
          </div>
        )}
      </div>
      <p className="text-[10px] text-gray-300 text-center">* Precio estimado si el producto no está disponible en algún supermercado.</p>
    </>
  );
}