'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Tag } from 'lucide-react';
import { formatearNombreCategoria } from '../../../shared/utils/format';

export default function CategoryFilter({
  categorias,
  selectedCategorias,
  onChange,
}: {
  categorias: { id: string; nombre: string }[];
  selectedCategorias: string[];
  onChange: (categorias: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCategorias = selectedCategorias || [];

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

  const toggleCategoria = (categoriaId: string) => {
    let nuevasCategorias: string[];
    
    if (categoriaId === 'Todas') {
      nuevasCategorias = [];
    } else {
      if (currentCategorias.includes(categoriaId)) {
        nuevasCategorias = currentCategorias.filter(c => c !== categoriaId);
      } else {
        nuevasCategorias = [...currentCategorias, categoriaId];
      }
    }

    startTransition(() => {
      onChange(nuevasCategorias);
    });
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
              <Tag size={16} className="text-[#FF6B35]" />
            )}
            {currentCategorias.length === 0 
              ? 'Todas las categorías' 
              : `${currentCategorias.length} seleccionada${currentCategorias.length > 1 ? 's' : ''}`
            }
          </div>
          <svg className={`-mr-1 ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-full md:w-72 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 border border-gray-50 overflow-hidden">
          <div className="py-2 max-h-80 overflow-y-auto no-scrollbar">
            <button
              onClick={() => { toggleCategoria('Todas'); setIsOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-3 text-sm text-left ${currentCategorias.length === 0 ? 'bg-blue-50 text-[#1A237E]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="font-bold">Todas las categorías</span>
              {currentCategorias.length === 0 && <span className="text-blue-500">✓</span>}
            </button>
            
            <div className="h-px bg-gray-100 my-1 mx-4"></div>

            {categorias.map((cat) => {
              const isSelected = currentCategorias.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategoria(cat.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm text-left transition-colors ${isSelected ? 'bg-orange-50 text-[#FF6B35]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FF6B35] border-[#FF6B35]' : 'border-gray-200 bg-white'}`}>
                      {isSelected && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className={isSelected ? 'font-bold' : 'font-medium'}>{formatearNombreCategoria(cat.nombre)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {currentCategorias.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => { toggleCategoria('Todas'); setIsOpen(false); }}
                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
