import React from 'react';

export default function LoadingCatalogo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cabecera Skeleton */}
      <div className="animate-pulse" style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="h-4 w-32 bg-blue-400/30 rounded mb-2"></div>
          <div className="h-10 w-64 bg-white/20 rounded mb-4"></div>
          <div className="h-4 w-48 bg-blue-300/20 rounded"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Dropdown Skeleton */}
        <div className="mb-10 flex justify-between">
          <div className="h-12 w-72 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-50 rounded-xl animate-pulse"></div>
        </div>

        {/* Grid de productos Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-4 h-96 flex flex-col gap-4 animate-pulse">
              <div className="w-full h-44 bg-gray-100 rounded-xl"></div>
              <div className="h-6 w-3/4 bg-gray-100 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-50 rounded"></div>
              <div className="mt-auto h-16 w-full bg-green-50/50 rounded-xl"></div>
              <div className="h-10 w-full bg-blue-50/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
