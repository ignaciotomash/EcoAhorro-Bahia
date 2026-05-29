export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      {/* Imagen skeleton */}
      <div className="w-full h-48 bg-gray-200"></div>

      {/* Contenido skeleton */}
      <div className="p-4 space-y-3">
        {/* Nombre producto */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>

        {/* Marca */}
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>

        {/* Categoría */}
        <div className="h-3 bg-gray-200 rounded w-2/5"></div>

        {/* Precios section */}
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Botón skeleton */}
        <div className="pt-2">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
