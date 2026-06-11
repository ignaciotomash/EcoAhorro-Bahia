import React from 'react';
import Link from 'next/link';

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
          <Link href="/" className="text-xs md:text-sm font-medium mb-2 md:mb-3 inline-block text-blue-200 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            TU CARRITO
          </h1>
          <p className="text-blue-200 text-xs md:text-sm mt-1">Cargando tus productos...</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-3">
          {[0, 1, 2].map(item => (
            <div key={item} className="bg-white rounded-2xl p-3 md:p-4 border border-gray-100 animate-pulse">
              <div className="flex gap-3 md:gap-4 items-start">
                <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl bg-gray-100" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-2.5 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                  <div className="flex gap-1.5 pt-1">
                    <div className="h-5 w-24 bg-gray-100 rounded-full" />
                    <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block rounded-2xl border border-gray-100 p-4 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded" />
            <div className="h-8 bg-gray-100 rounded" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
