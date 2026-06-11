import React from 'react';

export default function EscanerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl p-4 flex gap-4 items-start" style={{ border: '1px solid #E5E7EB' }}>
        <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
          <div className="h-5 w-5/6 bg-gray-200 rounded"></div>
          <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
          <div className="h-3 w-28 bg-gray-50 rounded font-mono"></div>
        </div>
      </div>
      <div>
        <div className="h-3 w-40 bg-gray-100 rounded mb-3"></div>
        <div className="space-y-2.5">
          <div className="bg-white rounded-2xl overflow-hidden border-2 border-green-100/50">
            <div className="px-4 py-3 flex justify-between items-center bg-green-50/20">
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 bg-green-200/50 rounded"></div>
                <div className="h-4 w-24 bg-green-200/30 rounded"></div>
              </div>
              <div className="h-5 w-24 bg-green-200/40 rounded"></div>
            </div>
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="px-4 py-3 flex justify-between items-center bg-gray-50/50">
                <div className="h-4 w-28 bg-gray-200/60 rounded"></div>
                <div className="h-4 w-20 bg-gray-200/40 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-14 w-full bg-gray-100 rounded-2xl"></div>
    </div>
  );
}
