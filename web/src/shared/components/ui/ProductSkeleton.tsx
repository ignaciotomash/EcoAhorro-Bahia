export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl flex flex-col h-full border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden min-w-0 animate-pulse">
      {/* Imagen skeleton */}
      <div className="relative w-full h-32 md:h-48 bg-gray-50 p-3 flex items-center justify-center border-b border-gray-50">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-200"></div>
      </div>

      {/* Contenido skeleton */}
      <div className="p-3 md:p-4 flex flex-col flex-1 gap-1.5 md:gap-2">
        <div className="flex-1">
          {/* Marca */}
          <div className="h-2 bg-gray-200 rounded w-1/3 mb-1.5"></div>
          {/* Nombre producto */}
          <div className="h-3 md:h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Precios section */}
        <div className="mt-1 space-y-1.5 md:space-y-2">
          <div className="h-5 md:h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Comparativa skeleton */}
        <div className="mt-1 md:mt-2 pt-2 md:pt-3 border-t border-gray-100">
          <div className="h-2 md:h-3 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Botón skeleton */}
        <div className="mt-2">
          <div className="h-8 md:h-10 bg-gray-200 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
