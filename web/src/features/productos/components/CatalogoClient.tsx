'use client';

import React, { useEffect, useState, useRef } from 'react';
import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import ProductCard from '../../../components/ProductCard';
import ProductSkeleton from '../../../components/ProductSkeleton';
import type { ProductoCatalogo as Producto, CatalogoResponse } from '@/features/productos/types';

export default function CatalogoClient({
  categorias,
  initialSelectedCategorias,
  initialData,
  initialPage,
  initialSearch = '',
}: {
  categorias: { id: string; nombre: string }[];
  initialSelectedCategorias: string[];
  initialData: CatalogoResponse;
  initialPage: number;
  initialSearch?: string;
}) {
  const [productosData, setProductosData] = useState<CatalogoResponse>(initialData);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(initialSelectedCategorias);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Implementación de debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectedCount = selectedCategorias.length;

  const buildUrl = (page: number, categorias: string[], sortBy: string, minPrice: number | null, maxPrice: number | null, search: string) => {
    const params = new URLSearchParams();
    if (categorias.length > 0) {
      params.set('categoria', categorias.join(','));
    }
    if (page > 1) {
      params.set('page', String(page));
    }
    if (sortBy) {
      params.set('sortBy', sortBy);
    }
    if (minPrice !== null) {
      params.set('minPrice', String(minPrice));
    }
    if (maxPrice !== null) {
      params.set('maxPrice', String(maxPrice));
    }
    if (search) {
      params.set('search', search);
    }
    const query = params.toString();
    return query ? `/catalogo?${query}` : '/catalogo';
  };

  const updateUrl = (page: number, categorias: string[], sortBy: string, minPrice: number | null, maxPrice: number | null, search: string) => {
    if (typeof window === 'undefined') return;
    const newUrl = buildUrl(page, categorias, sortBy, minPrice, maxPrice, search);
    window.history.replaceState({}, '', newUrl);
  };

  const fetchProductos = async (page: number, categorias: string[], sortBy: string, minPrice: number | null, maxPrice: number | null, search: string) => {
    // Cancelar la petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const url = new URL('/api/productos', window.location.origin);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', '24');
      if (categorias.length > 0) {
        url.searchParams.set('categoria', categorias.join(','));
      }
      if (sortBy) {
        url.searchParams.set('sortBy', sortBy);
      }
      if (minPrice !== null) {
        url.searchParams.set('minPrice', String(minPrice));
      }
      if (maxPrice !== null) {
        url.searchParams.set('maxPrice', String(maxPrice));
      }
      if (search) {
        url.searchParams.set('search', search);
      }

      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Error cargando productos');
      }

      const data: CatalogoResponse = await response.json();
      setProductosData(data);
      setError(null);
    } catch (fetchError: any) {
      // No mostrar error si fue una cancelación intencional
      if (fetchError?.name === 'AbortError') return;
      console.error(fetchError);
      setError('No se pudieron cargar los productos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      updateUrl(initialPage, selectedCategorias, sortBy, minPrice, maxPrice, initialSearch);
      return;
    }

    fetchProductos(currentPage, selectedCategorias, sortBy, minPrice, maxPrice, debouncedSearch);
    updateUrl(currentPage, selectedCategorias, sortBy, minPrice, maxPrice, debouncedSearch);
    // Scroll al principio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategorias, currentPage, sortBy, minPrice, maxPrice, debouncedSearch]);

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 1000);
  };

  const handleCategoryChange = (newCategorias: string[]) => {
    setCurrentPage(1);
    setSelectedCategorias(newCategorias);
  };

  const handlePriceFilterChange = (filters: { sortBy: string; minPrice: number | null; maxPrice: number | null }) => {
    setCurrentPage(1);
    setSortBy(filters.sortBy);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const { productos, totalPages, totalProductos } = productosData;

  return (
    <div className="min-h-screen bg-white">
      {/* Notificación */}
      {notification && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[999] pointer-events-none">
          <div className={`px-4 md:px-6 py-2 md:py-3 rounded-lg text-[10px] md:text-xs font-semibold text-white shadow-lg animate-fadeIn pointer-events-auto ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {notification.message}
          </div>
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }
          `}</style>
        </div>
      )}

      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-10">
          <p className="text-[10px] md:text-sm font-medium mb-0.5" style={{ color: '#FFCBB5' }}>Eco Ahorro Bahía</p>
          <h1 className="text-lg md:text-4xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            CATÁLOGO COMPLETO
          </h1>
          <p className="mt-0.5 text-[10px] md:text-sm text-blue-200">
            {selectedCount === 0
              ? `${totalProductos} productos disponibles`
              : `${productos.length} de ${totalProductos} filtrados`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-3 md:py-8 px-4">
        <div className="mb-4 md:mb-10 flex flex-col md:flex-row justify-between md:items-start gap-4 relative z-20" style={isLoading ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
          {/* Contenedor ajustado al contenido */}
          <div className="flex flex-col gap-3 md:gap-4 w-full md:w-max">
            {/* Buscador */}
            <div className="w-full flex items-center bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl shadow-sm focus-within:border-[#FF6B35] transition-colors p-1 md:p-1.5">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm outline-none bg-transparent min-w-[120px]"
              />
              <button
                type="button"
                className="px-4 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold text-white transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: '#FF6B35' }}
              >
                Buscar
              </button>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2 md:gap-3 w-full">
              <div className="flex-1">
                <CategoryFilter
                  categorias={categorias}
                  selectedCategorias={selectedCategorias}
                  onChange={handleCategoryChange}
                />
              </div>
              <div className="flex-1">
                <PriceFilter
                  sortBy={sortBy}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChange={handlePriceFilterChange}
                />
              </div>
            </div>
          </div>

          <div className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl mt-1">
            Precios actualizados
          </div>
        </div>

        {error && (
          <div className="text-center py-20 text-red-500">
            {error}
          </div>
        )}

        {isLoading && !error && (
          <>
            {/* Overlay para prevenir interacción */}
            <div className="fixed inset-0 bg-white/40 pointer-events-none"></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-5">
              {Array.from({ length: productos.length || 24 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {!isLoading && !error && productos.length > 0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-5">
              {productos.map((prod) => (
                <ProductCard key={prod.id} producto={prod} />
              ))}
            </div>

            <div className="mt-6 md:mt-12 flex flex-wrap justify-center items-center gap-1 md:gap-2">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-white text-[9px] md:text-xs transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                  title="Primera página"
                >
                  ⏮ Inicio
                </button>
              )}

              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-white text-[9px] md:text-xs transition-all hover:opacity-90"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  ← Anterior
                </button>
              )}

              {Array.from({ length: Math.min(4, currentPage - 1) }).map((_, i) => {
                const prevLen = Math.min(4, currentPage - 1);
                const pageNum = currentPage - prevLen + i;
                return (
                  <button
                    key={`prev-${pageNum}`}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold text-gray-600 bg-gray-100 text-[9px] md:text-xs transition-all hover:bg-gray-200"
                  >
                    {pageNum}
                  </button>
                );
              })}

              <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-white text-[9px] md:text-xs" style={{ backgroundColor: '#1A237E' }}>
                {currentPage} / {totalPages}
              </span>

              {Array.from({ length: Math.min(4, totalPages - currentPage) }).map((_, i) => {
                const pageNum = currentPage + 1 + i;
                return (
                  <button
                    key={`next-${pageNum}`}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold text-gray-600 bg-gray-100 text-[9px] md:text-xs transition-all hover:bg-gray-200"
                  >
                    {pageNum}
                  </button>
                );
              })}

              {currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-white text-[9px] md:text-xs transition-all hover:opacity-90"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  Siguiente →
                </button>
              )}

              {currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-white text-[9px] md:text-xs transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                  title="Última página"
                >
                  Final ⏭
                </button>
              )}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ir a..."
                  maxLength={5}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const pageNum = parseInt(e.currentTarget.value);
                      if (e.currentTarget.value.trim() === '' || isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
                        showNotification(`Nro entre 1 y ${totalPages}`);
                        e.currentTarget.value = '';
                        return;
                      }
                      handlePageChange(pageNum);
                      e.currentTarget.value = '';
                    }
                  }}
                  onChange={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }}
                  className="w-10 md:w-12 px-1.5 md:px-2 py-1.5 md:py-2 border border-gray-300 rounded-lg text-center text-[9px] md:text-xs focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-orange-100"
                  title={`Ingresa un número entre 1 y ${totalPages}`}
                />
              </div>
            </div>
          </>
        )}

        {!isLoading && !error && productos.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No se encontraron productos para los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
