'use client';

import React, { useEffect, useState, useRef } from 'react';
import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

type Precio = {
  super: string;
  valor: number;
};

type Producto = {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  imagen: string;
  precios: Precio[];
};

type CatalogoResponse = {
  productos: Producto[];
  totalPages: number;
  totalProductos: number;
};

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
        <div className="mb-4 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 relative z-50">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1" style={isLoading ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
            <div className="flex-1 md:max-w-sm">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 md:py-3 bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl text-xs md:text-sm outline-none focus:border-[#FF6B35] transition-colors shadow-sm"
              />
            </div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar">
              <CategoryFilter
                categorias={categorias}
                selectedCategorias={selectedCategorias}
                onChange={handleCategoryChange}
              />
              <PriceFilter
                sortBy={sortBy}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onChange={handlePriceFilterChange}
              />
            </div>
          </div>
          <div className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
            Actualizado hoy
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
            <div className="fixed inset-0 bg-white/40 z-40 pointer-events-auto" style={{ pointerEvents: 'none' }}></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-5 relative z-30">
              {Array.from({ length: productos.length || 24 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {!isLoading && !error && productos.length > 0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-5 relative z-10">
              {productos.map((prod) => (
                <ProductCard key={prod.id} producto={prod} />
              ))}
            </div>

            <div className="mt-6 md:mt-12 flex justify-center items-center gap-2 md:gap-4">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-white text-[10px] md:text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                >
                  ← Anterior
                </button>
              )}

              <span className="text-[10px] md:text-sm font-medium text-gray-500">
                {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-white text-[10px] md:text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                >
                  Siguiente →
                </button>
              )}
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
