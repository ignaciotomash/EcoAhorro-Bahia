'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';

type PriceFilterProps = {
  sortBy: string;
  minPrice: number | null;
  maxPrice: number | null;
  onChange: (filters: { sortBy: string; minPrice: number | null; maxPrice: number | null }) => void;
};

export default function PriceFilter({ sortBy, minPrice, maxPrice, onChange }: PriceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState<string>(minPrice ? String(minPrice) : '');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(maxPrice ? String(maxPrice) : '');
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (newSort: string) => {
    startTransition(() => {
      onChange({
        sortBy: newSort,
        minPrice: minPrice,
        maxPrice: maxPrice,
      });
    });
    setIsOpen(false);
  };

  const handleMinPriceChange = (value: string) => {
    setLocalMinPrice(value);
  };

  const handleMaxPriceChange = (value: string) => {
    setLocalMaxPrice(value);
  };

  const applyPriceFilters = () => {
    const newMin = localMinPrice ? parseInt(localMinPrice, 10) : null;
    const newMax = localMaxPrice ? parseInt(localMaxPrice, 10) : null;

    startTransition(() => {
      onChange({
        sortBy,
        minPrice: newMin,
        maxPrice: newMax,
      });
    });
  };

  const getDisplayText = () => {
    if (sortBy === 'price_asc') return 'Menor a Mayor';
    if (sortBy === 'price_desc') return 'Mayor a Menor';
    if (minPrice || maxPrice) {
      return `Precio: ${minPrice || '0'}-${maxPrice || '∞'}`;
    }
    return 'Ordenar por precio';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex justify-between items-center w-full md:w-72 px-4 md:px-5 py-2.5 md:py-3 bg-white border-2 rounded-2xl text-xs md:text-sm font-bold transition-all focus:outline-none shadow-sm flex-shrink-0 ${
            isPending ? 'border-orange-200 opacity-70 cursor-wait' : 'border-gray-100 text-gray-700 hover:border-[#FF6B35]'
          }`}
        >
          <div className="flex items-center gap-2">
            {isPending ? (
              <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-[#FF6B35]">💰</span>
            )}
            {getDisplayText()}
          </div>
          <svg className={`-mr-1 ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-full md:w-80 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 border border-gray-50 overflow-hidden">
          <div className="py-2 px-4">
            {/* Opciones de ordenamiento */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ordenar</p>
              <button
                onClick={() => handleSortChange('price_asc')}
                className={`w-full text-left px-4 py-3 text-sm rounded-lg mb-2 transition-colors ${
                  sortBy === 'price_asc' ? 'bg-orange-50 text-[#FF6B35] font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                ↑ Menor a Mayor precio
              </button>
              <button
                onClick={() => handleSortChange('price_desc')}
                className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors ${
                  sortBy === 'price_desc' ? 'bg-orange-50 text-[#FF6B35] font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                ↓ Mayor a Menor precio
              </button>
            </div>

            <div className="h-px bg-gray-100 my-3"></div>

            {/* Filtros de rango */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Rango de precio</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Mín"
                  value={localMinPrice}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={localMaxPrice}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
              <button
                onClick={applyPriceFilters}
                className="w-full mt-3 py-2 px-4 bg-[#FF6B35] text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                Aplicar filtro
              </button>
            </div>

            {(minPrice || maxPrice || sortBy !== '') && (
              <>
                <div className="h-px bg-gray-100 my-3"></div>
                <button
                  onClick={() => {
                    setLocalMinPrice('');
                    setLocalMaxPrice('');
                    startTransition(() => {
                      onChange({ sortBy: '', minPrice: null, maxPrice: null });
                    });
                  }}
                  className="w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
