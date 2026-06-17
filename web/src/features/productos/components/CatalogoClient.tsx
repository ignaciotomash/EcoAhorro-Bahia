'use client';

import CatalogFilters from './CatalogFilters';
import CatalogHeader from './CatalogHeader';
import CatalogNotification from './CatalogNotification';
import CatalogPagination from './CatalogPagination';
import CatalogProductGrid from './CatalogProductGrid';
import { useCatalogoController } from '@/features/productos/hooks/useCatalogoController';
import type { CatalogoResponse } from '@/features/productos/types';

type CatalogoClientProps = {
  categorias: { id: string; nombre: string }[];
  initialSelectedCategorias: string[];
  initialData: CatalogoResponse;
  initialPage: number;
  initialSearch?: string;
};

export default function CatalogoClient({
  categorias,
  initialSelectedCategorias,
  initialData,
  initialPage,
  initialSearch = '',
}: CatalogoClientProps) {
  const {
    productosData,
    selectedCategorias,
    selectedCount,
    currentPage,
    sortBy,
    minPrice,
    maxPrice,
    searchQuery,
    error,
    notification,
    isLoading,
    handleSearchChange,
    handleCategoryChange,
    handlePriceFilterChange,
    handlePageChange,
    handleGoToPage,
  } = useCatalogoController({
    initialSelectedCategorias,
    initialData,
    initialPage,
    initialSearch,
  });

  const { productos, totalPages, totalProductos } = productosData;

  return (
    <div className="min-h-screen bg-white">
      <CatalogNotification notification={notification} />

      <CatalogHeader
        selectedCount={selectedCount}
        totalProductos={totalProductos}
        visibleProductos={productos.length}
      />

      <div className="max-w-7xl mx-auto py-3 md:py-8 px-4">
        <CatalogFilters
          categorias={categorias}
          selectedCategorias={selectedCategorias}
          searchQuery={searchQuery}
          sortBy={sortBy}
          minPrice={minPrice}
          maxPrice={maxPrice}
          isLoading={isLoading}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onPriceFilterChange={handlePriceFilterChange}
        />

        {error && (
          <div className="text-center py-20 text-red-500">
            {error}
          </div>
        )}

        {isLoading && !error && (
          <CatalogProductGrid productos={productos} isLoading />
        )}

        {!isLoading && !error && productos.length > 0 && (
          <>
            <CatalogProductGrid productos={productos} isLoading={false} />
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onGoToPage={handleGoToPage}
            />
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
