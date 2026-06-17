import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import type { CategoriaOption, PriceFilters } from '@/features/productos/hooks/useCatalogoController';

type CatalogFiltersProps = {
  categorias: CategoriaOption[];
  selectedCategorias: string[];
  searchQuery: string;
  sortBy: string;
  minPrice: number | null;
  maxPrice: number | null;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categorias: string[]) => void;
  onPriceFilterChange: (filters: PriceFilters) => void;
};

export default function CatalogFilters({
  categorias,
  selectedCategorias,
  searchQuery,
  sortBy,
  minPrice,
  maxPrice,
  isLoading,
  onSearchChange,
  onCategoryChange,
  onPriceFilterChange,
}: CatalogFiltersProps) {
  return (
    <div
      className="mb-4 md:mb-10 flex flex-col md:flex-row justify-between md:items-start gap-4 relative z-20"
      style={isLoading ? { pointerEvents: 'none' } : {}}
    >
      <div className="flex flex-col gap-3 md:gap-4 w-full md:w-max">
        <div className="w-full flex items-center bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl shadow-sm focus-within:border-[#FF6B35] transition-colors p-1 md:p-1.5">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
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

        <div className="flex gap-2 md:gap-3 w-full">
          <div className="flex-1">
            <CategoryFilter
              categorias={categorias}
              selectedCategorias={selectedCategorias}
              onChange={onCategoryChange}
            />
          </div>
          <div className="flex-1">
            <PriceFilter
              sortBy={sortBy}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onChange={onPriceFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl mt-1">
        Precios actualizados
      </div>
    </div>
  );
}
