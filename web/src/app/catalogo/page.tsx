import React from 'react';
import ProductCard from '../../components/ProductCard';
import { PRODUCTOS_MOCK } from '../../constants/productos';

export default function CatalogoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="text-sm font-medium mb-1" style={{ color: '#FFCBB5' }}>Eco Ahorro Bahía</p>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            CATÁLOGO COMPLETO
          </h1>
          <p className="mt-1 text-sm text-blue-200">
            {PRODUCTOS_MOCK.length} productos comparados entre supermercados
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {PRODUCTOS_MOCK.map(prod => (
            <ProductCard key={prod.id} producto={prod} />
          ))}
        </div>
      </div>
    </div>
  );
}