import React from 'react';

export default function LoadingCatalogo() {
  return (
    <div className="min-h-screen bg-white">
      {/* CABECERA SKELETON */}
      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-4 w-32 bg-blue-400/30 rounded mb-2"></div>
          <div className="h-10 w-80 bg-white/20 rounded mb-3"></div>
          <div className="h-4 w-60 bg-blue-300/20 rounded"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* DROPDOWN & UPDATE BAR SKELETON */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="h-12 w-full md:w-72 bg-gray-100 rounded-2xl"></div>
          <div className="h-8 w-36 bg-gray-50 rounded-xl self-start md:self-auto"></div>
        </div>

        {/* GRID DE PRODUCTOS SKELETON (8 TARJETAS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 p-4 h-[420px] flex flex-col animate-pulse bg-white"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            >
              {/* Image Skeleton */}
              <div className="w-full h-44 bg-gray-50 rounded-xl mb-4"></div>
              
              {/* Category, Title, Brand */}
              <div className="space-y-2 mb-3">
                <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
              </div>
              
              {/* Green Best Price Box */}
              <div className="rounded-xl p-3 mb-3 bg-green-50/40 border border-green-100/50 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-green-200/50 rounded"></div>
                  <div className="h-4 w-12 bg-green-200/30 rounded-full"></div>
                </div>
                <div className="h-6 w-24 bg-green-200/60 rounded"></div>
              </div>

              {/* Comparative Prices List */}
              <div className="space-y-2 mb-4">
                <div className="h-1 w-full bg-gray-100/80 rounded mb-1"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-100 rounded"></div>
                  <div className="h-3 w-12 bg-gray-100 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-gray-100 rounded"></div>
                  <div className="h-3 w-12 bg-gray-100 rounded"></div>
                </div>
              </div>

              {/* Button Skeleton */}
              <div className="mt-auto h-10 w-full bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
