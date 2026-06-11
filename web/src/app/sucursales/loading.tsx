import React from 'react';

export default function SucursalesLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="p-8 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-96 bg-gray-200 rounded mb-4"></div>

        <div className="h-12 w-52 bg-gray-100 rounded-lg mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="h-[500px] bg-gray-100 rounded-2xl"></div>
          </div>

          <div className="bg-white p-5 border rounded-2xl shadow-sm h-[500px] flex flex-col">
            <div className="h-5 w-44 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
