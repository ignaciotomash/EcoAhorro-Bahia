'use client';

import React from 'react';
import type { ResultadoOptimizacion, TotalPorSuper } from '@/features/carrito/types';
import FiltroSupermercados from './FiltroSupermercados';
import SelectorMaxSupers from './SelectorMaxSupers';
import ComparativaNormal from './side-bar/ComparativaNormal';
import ComparativaMulti from './side-bar/ComparativaMulti';

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
        <ComparativaNormal
          totalesPorSuper={totalesPorSuper}
          huboFallback={huboFallbackNormal}
        />
      )}

      {/* COMPARATIVA — modo multi-supermercado (con máximo elegido) */}
      {modoMulti && resultadoMulti && (
        <ComparativaMulti
          resultadoMulti={resultadoMulti}
          huboFallback={huboFallbackMulti}
          supersAbiertos={supersAbiertos}
          onToggleSuper={onToggleSuper}
        />
      )}
    </div>
  );
}