import React from 'react';

export default function EscanerLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 animate-pulse">
          <div className="h-3 w-28 bg-blue-300/20 rounded mb-1"></div>
          <div className="h-8 w-64 bg-white/20 rounded mb-2"></div>
          <div className="h-3 w-52 bg-blue-300/20 rounded"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 md:py-8 space-y-4 md:space-y-5 animate-pulse">
        <div className="bg-white rounded-2xl p-4 md:p-5" style={{ border: '1px solid #E5E7EB' }}>
          <div className="h-3 w-44 bg-gray-100 rounded mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-11 flex-1 bg-gray-50 rounded-xl"></div>
            <div className="h-11 w-24 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <div className="h-3 w-4 bg-gray-100 rounded" />
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="h-11 w-full bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
