import React from 'react';

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SKELETON */}
      <section style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8 animate-pulse">
          {/* Left Side */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-block h-6 w-44 bg-white/20 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-10 md:h-12 w-3/4 bg-white/20 rounded-xl mx-auto md:mx-0"></div>
              <div className="h-10 md:h-12 w-1/2 bg-white/20 rounded-xl mx-auto md:mx-0"></div>
            </div>
            <div className="h-4 w-5/6 bg-white/10 rounded-md mx-auto md:mx-0"></div>
            {/* Search Input Skeleton */}
            <div className="h-14 w-full max-w-lg bg-white/10 rounded-xl border border-white/5"></div>
          </div>

          {/* Right Side: Logo Circle Skeleton */}
          <div className="flex-shrink-0">
            <div className="w-36 h-36 rounded-full bg-white/10 border-3 border-white/20"></div>
          </div>
        </div>
      </section>

      {/* STATS BAR SKELETON */}
      <div className="border-b" style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E7EB' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex gap-6 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* ACCESS BANNER SKELETON */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <div className="h-20 w-full rounded-2xl bg-orange-50/50 border border-orange-100/50 p-4 flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-56 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* FEATURED PRODUCTS SKELETON */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-36 bg-gray-100 rounded"></div>
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>

        {/* 4 Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 p-4 h-[380px] flex flex-col animate-pulse bg-white"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            >
              {/* Image Skeleton */}
              <div className="w-full h-40 bg-gray-50 rounded-xl mb-4"></div>
              {/* Category, Title, Brand */}
              <div className="space-y-2 mb-4">
                <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
              </div>
              {/* Green best price skeleton */}
              <div className="rounded-xl p-3 mb-4 bg-green-50/40 border border-green-100/50 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-green-200/50 rounded"></div>
                  <div className="h-4 w-12 bg-green-200/30 rounded-full"></div>
                </div>
                <div className="h-7 w-24 bg-green-200/60 rounded"></div>
              </div>
              {/* Button Skeleton */}
              <div className="mt-auto h-10 w-full bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
