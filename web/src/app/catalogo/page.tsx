import React from 'react';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { getProductosCatalogo, getCategorias } from '../../services/db';
import CategoryFilter from '../../components/CategoryFilter';

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const currentCategoria = params.categoria || 'Todas';
  const limit = 100;

  const [
    { productos, totalPages, totalProductos },
    categorias
  ] = await Promise.all([
    getProductosCatalogo(currentPage, limit, currentCategoria),
    getCategorias()
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="text-sm font-medium mb-1" style={{ color: '#FFCBB5' }}>Eco Ahorro Bahía</p>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            CATÁLOGO COMPLETO
          </h1>
          <p className="mt-1 text-sm text-blue-200">
            {currentCategoria === 'Todas' 
              ? `Mostrando los ${totalProductos} productos de todas las categorías`
              : `Mostrando ${productos.length} de ${totalProductos} productos filtrados`
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* BARRA DE FILTROS DESPLEGABLE */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CategoryFilter categorias={categorias} />
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">
             Actualizado hoy
          </div>
        </div>

        {productos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {productos.map(prod => (
                <ProductCard key={prod.id} producto={prod} />
              ))}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            <div className="mt-12 flex justify-center items-center gap-4">
              {currentPage > 1 && (
                <Link
                  href={`/catalogo?page=${currentPage - 1}&categoria=${currentCategoria}`}
                  className="px-6 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                >
                  ← Anterior
                </Link>
              )}
              
              <span className="text-sm font-medium text-gray-500">
                Página <strong className="text-gray-900">{currentPage}</strong> de {totalPages}
              </span>

              {currentPage < totalPages && (
                <Link
                  href={`/catalogo?page=${currentPage + 1}&categoria=${currentCategoria}`}
                  className="px-6 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                >
                  Siguiente →
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            No se encontraron productos para los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}