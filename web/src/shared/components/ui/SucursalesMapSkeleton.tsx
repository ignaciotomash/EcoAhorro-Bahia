import React from 'react';

export default function SucursalesMapSkeleton() {
  return (
    <div className="h-[500px] bg-gray-100 animate-pulse flex items-center justify-center rounded-2xl">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-200" />
        <p className="text-sm text-gray-400">Cargando mapa...</p>
      </div>
    </div>
  );
}
