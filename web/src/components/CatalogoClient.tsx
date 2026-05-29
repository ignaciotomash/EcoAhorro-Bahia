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
}: {
  categorias: { id: string; nombre: string }[];
  initialSelectedCategorias: string[];
  initialData: CatalogoResponse;
  initialPage: number;
}) {
  const [productosData, setProductosData] = useState<CatalogoResponse>(initialData);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(initialSelectedCategorias);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  const selectedCount = selectedCategorias.length;

  const buildUrl = (page: number, categorias: string[], sortBy: string, minPrice: number | null, maxPrice: number | null) => {
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
    const query = params.toString();
    return query ? `/catalogo?${query}` : '/catalogo';
  };

  const updateUrl = (page: number, categorias: string[], sortBy: string, minPrice: number | null, maxPrice: number | null) => {
    if (typeof window === 'undefined') return;
    const newUrl = buildUrl(page, categorias, sortBy, minPrice, maxPrice);
    window.history.replaceState({}, '', newUrl);
  };

  const fetchProductos = async (page: number, categorias: string[], sortBy: string, minPrice: number | null, maxPrice: number | null) => {
    setIsLoading(true);
    try {
      const url = new URL('/api/productos', window.location.origin);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', '100');
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

      const response = await fetch(url.toString(), {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Error cargando productos');
      }

      const data: CatalogoResponse = await response.json();
      setProductosData(data);
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError('No se pudieron cargar los productos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      updateUrl(initialPage, selectedCategorias, sortBy, minPrice, maxPrice);
      return;
    }

    fetchProductos(currentPage, selectedCategorias, sortBy, minPrice, maxPrice);
    updateUrl(currentPage, selectedCategorias, sortBy, minPrice, maxPrice);
    // Scroll al principio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategorias, currentPage, sortBy, minPrice, maxPrice]);

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
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="text-sm font-medium mb-1" style={{ color: '#FFCBB5' }}>Eco Ahorro Bahía</p>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            CATÁLOGO COMPLETO
          </h1>
          <p className="mt-1 text-sm text-blue-200">
            {selectedCount === 0
              ? `Mostrando los ${totalProductos} productos de todas las categorías`
              : `Mostrando ${productos.length} de ${totalProductos} productos filtrados`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-50">
          <div className="flex flex-col md:flex-row gap-4 flex-1" style={isLoading ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
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
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-30">
              {Array.from({ length: productos.length || 100 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {!isLoading && !error && productos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
              {productos.map((prod) => (
                <ProductCard key={prod.id} producto={prod} />
              ))}
            </div>

            <div className="mt-12 flex justify-center items-center gap-4">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-6 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                >
                  ← Anterior
                </button>
              )}

              <span className="text-sm font-medium text-gray-500">
                Página <strong className="text-gray-900">{currentPage}</strong> de {totalPages}
              </span>

              {currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-6 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90"
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
