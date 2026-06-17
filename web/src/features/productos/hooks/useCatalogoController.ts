import { useEffect, useRef, useState } from 'react';
import type { CatalogoResponse } from '@/features/productos/types';

export type CategoriaOption = {
  id: string;
  nombre: string;
};

export type PriceFilters = {
  sortBy: string;
  minPrice: number | null;
  maxPrice: number | null;
};

export type CatalogNotification = {
  message: string;
  type: 'error' | 'success';
};

type UseCatalogoControllerParams = {
  initialSelectedCategorias: string[];
  initialData: CatalogoResponse;
  initialPage: number;
  initialSearch?: string;
};

function buildUrl(
  page: number,
  categorias: string[],
  sortBy: string,
  minPrice: number | null,
  maxPrice: number | null,
  search: string,
) {
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
}

function updateUrl(
  page: number,
  categorias: string[],
  sortBy: string,
  minPrice: number | null,
  maxPrice: number | null,
  search: string,
) {
  if (typeof window === 'undefined') return;

  const newUrl = buildUrl(page, categorias, sortBy, minPrice, maxPrice, search);
  window.history.replaceState({}, '', newUrl);
}

export function useCatalogoController({
  initialSelectedCategorias,
  initialData,
  initialPage,
  initialSearch = '',
}: UseCatalogoControllerParams) {
  const [productosData, setProductosData] = useState<CatalogoResponse>(initialData);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(initialSelectedCategorias);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<CatalogNotification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ message, type });
    window.setTimeout(() => {
      setNotification(null);
    }, 1000);
  };

  const fetchProductos = async (
    page: number,
    categorias: string[],
    selectedSortBy: string,
    selectedMinPrice: number | null,
    selectedMaxPrice: number | null,
    search: string,
  ) => {
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
      if (selectedSortBy) {
        url.searchParams.set('sortBy', selectedSortBy);
      }
      if (selectedMinPrice !== null) {
        url.searchParams.set('minPrice', String(selectedMinPrice));
      }
      if (selectedMaxPrice !== null) {
        url.searchParams.set('maxPrice', String(selectedMaxPrice));
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
    } catch (fetchError: unknown) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategorias, currentPage, sortBy, minPrice, maxPrice, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategorias: string[]) => {
    setCurrentPage(1);
    setSelectedCategorias(newCategorias);
  };

  const handlePriceFilterChange = (filters: PriceFilters) => {
    setCurrentPage(1);
    setSortBy(filters.sortBy);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleGoToPage = (value: string, reset: () => void) => {
    const pageNum = parseInt(value);

    if (value.trim() === '' || isNaN(pageNum) || pageNum < 1 || pageNum > productosData.totalPages) {
      showNotification(`Nro entre 1 y ${productosData.totalPages}`);
      reset();
      return;
    }

    handlePageChange(pageNum);
    reset();
  };

  return {
    productosData,
    selectedCategorias,
    selectedCount: selectedCategorias.length,
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
  };
}
