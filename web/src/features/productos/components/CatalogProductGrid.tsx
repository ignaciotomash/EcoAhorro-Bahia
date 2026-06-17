import ProductCard from '@/shared/components/ui/ProductCard';
import ProductSkeleton from '@/shared/components/ui/ProductSkeleton';
import type { ProductoCatalogo } from '@/features/productos/types';

type CatalogProductGridProps = {
  productos: ProductoCatalogo[];
  isLoading: boolean;
};

export default function CatalogProductGrid({ productos, isLoading }: CatalogProductGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-5">
      {isLoading
        ? Array.from({ length: productos.length || 24 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        : productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
    </div>
  );
}
