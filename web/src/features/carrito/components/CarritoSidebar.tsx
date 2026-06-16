'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ResultadoOptimizacion, TotalPorSuper } from '@/features/carrito/types';
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

  // Solo combinaciones completas
  soloCompletas: boolean;
  onSoloCompletasChange: (value: boolean) => void;

  // Optimización
  hayCambios: boolean;
  onOptimizar: () => void;

  // Resultados
  modoMulti: boolean;
  resultadoMulti: ResultadoOptimizacion | null;
  totalesPorSuper: TotalPorSuper[];

  // Fallback: soloCompletas estaba activo pero nadie cubre el 100%
  huboFallbackNormal: boolean;
  huboFallbackMulti: boolean;

  // Desplegables (modo multi) — supers con detalle de productos abierto
  supersAbiertos: Set<string>;
  onToggleSuper: (nombre: string) => void;
}

export default function CarritoSidebar({
  supermercados,
  seleccionados,
  onFiltroChange,
  maxSupers,
  onMaxSupersChange,
  soloCompletas,
  onSoloCompletasChange,
  hayCambios,
  onOptimizar,
  modoMulti,
  resultadoMulti,
  totalesPorSuper,
  huboFallbackNormal,
  huboFallbackMulti,
  supersAbiertos,
  onToggleSuper,
}: CarritoSidebarProps) {
  const superMasBarato = totalesPorSuper[0];
  const superMasCaro = totalesPorSuper[totalesPorSuper.length - 1];
  const ahorro = !huboFallbackNormal && superMasCaro && superMasBarato
    ? superMasCaro.total - superMasBarato.total
    : 0;

  // Estado local: qué desplegables de "faltantes" están abiertos (modo normal, por super)
  const [faltantesAbiertosNormal, setFaltantesAbiertosNormal] = useState<Set<string>>(new Set());
  const toggleFaltantesNormal = (nombre: string) => {
    setFaltantesAbiertosNormal(prev => {
      const next = new Set(prev);
      next.has(nombre) ? next.delete(nombre) : next.add(nombre);
      return next;
    });
  };

  // Estado local: desplegable único de "productos faltantes" en modo multi
  const [faltantesMultiAbierto, setFaltantesMultiAbierto] = useState(false);

  return (
    <div className="space-y-4 overflow-visible">

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

      {/* SOLO COMBINACIONES COMPLETAS */}
      <label className="flex items-center gap-2.5 bg-white rounded-2xl p-4 cursor-pointer"
        style={{ border: '1px solid #E5E7EB' }}>
        <input
          type="checkbox"
          checked={soloCompletas}
          onChange={e => onSoloCompletasChange(e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ accentColor: '#1A237E' }}
        />
        <span className="text-xs md:text-sm font-semibold text-gray-700">
          Solo mostrar combinaciones con todos los productos disponibles
        </span>
      </label>

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

      {/* COMPARATIVA — modo normal (sin máximo de supers elegido) */}
      {!modoMulti && (
        <>
          <h2 className="font-black text-gray-800" style={{ fontFamily: "'Oswald', sans-serif" }}>COMPARATIVA</h2>

          {huboFallbackNormal && (
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
              const faltantesOpen = faltantesAbiertosNormal.has(s.nombre);
              const esPrimero = i === 0;
              // Etiqueta: en fallback el criterio principal es "más productos",
              // en modo normal el criterio es precio.
              const etiqueta = huboFallbackNormal
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
                            onClick={() => toggleFaltantesNormal(s.nombre)}
                            className="flex items-center gap-1 text-[10px] text-amber-600 font-medium hover:text-amber-700 transition-colors"
                          >
                            Faltan {s.faltantes.length} {s.faltantes.length === 1 ? 'producto' : 'productos'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 transition-transform"
                              style={{ transform: faltantesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
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

                  {/* Desplegable de productos faltantes para este super */}
                  {faltantesOpen && s.faltantes.length > 0 && (
                    <div style={{ backgroundColor: '#FFFBEB', borderTop: '1px solid #FEF3C7' }}>
                      {s.faltantes.map((f, j) => (
                        <div key={f.id} className="flex items-center gap-2 px-4 py-2"
                          style={{ borderBottom: j < s.faltantes.length - 1 ? '1px solid #FEF3C7' : 'none' }}>
                          {f.imagen
                            ? <Image src={f.imagen} alt={f.nombre} width={24} height={24}
                                className="rounded-md object-contain bg-white flex-shrink-0 p-0.5 border border-amber-100" />
                            : <div className="w-6 h-6 rounded-md bg-amber-100 flex-shrink-0" />
                          }
                          <p className="text-xs text-amber-800 truncate">{f.nombre}</p>
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

      {/* COMPARATIVA — modo multi-supermercado (con máximo elegido) */}
      {modoMulti && resultadoMulti && (
        <>
          <h2 className="font-black text-gray-800" style={{ fontFamily: "'Oswald', sans-serif" }}>COMPARATIVA</h2>

          {huboFallbackMulti && (
            <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100">
              <p className="text-xs font-semibold text-amber-700">
                No hay una combinación con ese límite de supermercados que cubra todos los productos. Mostrando la opción con más productos disponibles.
              </p>
            </div>
          )}

          {/* Total general */}
          <div className="rounded-2xl p-4 bg-green-50 border border-green-100">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">
              {huboFallbackMulti ? 'Total estimado' : 'Total optimizado'}
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
                  {abierto && (
                    <div style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                      {s.productos.map((prod, j) => (
                        <div key={j} className="flex items-center justify-between px-4 py-2.5"
                          style={{ borderBottom: j < s.productos.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <div className="flex items-center gap-2 min-w-0">
                            {prod.imagen
                              ? <Image src={prod.imagen} alt={prod.nombre} width={32} height={32}
                                  className="rounded-lg object-contain bg-white flex-shrink-0 p-0.5 border border-gray-100" />
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

            {/* Bloque de productos faltantes, fuera de cualquier supermercado */}
            {resultadoMulti.faltantes.length > 0 && (
              <div style={{ borderTop: '1px solid #F3F4F6' }}>
                <button
                  onClick={() => setFaltantesMultiAbierto(prev => !prev)}
                  className="w-full flex justify-between items-center px-4 py-3.5 transition-colors hover:bg-amber-50"
                  style={{ backgroundColor: faltantesMultiAbierto ? '#FFFBEB' : 'white' }}
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
                    style={{ transform: faltantesMultiAbierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {faltantesMultiAbierto && (
                  <div style={{ backgroundColor: '#FFFBEB', borderTop: '1px solid #FEF3C7' }}>
                    {resultadoMulti.faltantes.map((f, j) => (
                      <div key={f.id} className="flex items-center gap-2 px-4 py-2.5"
                        style={{ borderBottom: j < resultadoMulti.faltantes.length - 1 ? '1px solid #FEF3C7' : 'none' }}>
                        {f.imagen
                          ? <Image src={f.imagen} alt={f.nombre} width={24} height={24}
                              className="rounded-md object-contain bg-white flex-shrink-0 p-0.5 border border-amber-100" />
                          : <div className="w-6 h-6 rounded-md bg-amber-100 flex-shrink-0" />
                        }
                        <p className="text-xs text-amber-800 truncate">{f.nombre}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-300 text-center">* Precio estimado si el producto no está disponible en algún supermercado.</p>
        </>
      )}
    </div>
  );
}