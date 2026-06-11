'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const MapaSucursales = dynamic(() => import('./MapaSucursales'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa...</div>
});

type Sucursal = {
  id: number;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  supermercadoId: number;
};

export default function SucursalesPage({ sucursales: todasLasSucursales }: { sucursales: Sucursal[] }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        alert("Error al obtener ubicación: " + err.message);
      }
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Encuentra tu sucursal más cercana</h1>

      <button
        onClick={handleGetLocation}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
      >
        📍 Usar mi ubicación actual
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 shadow-xl border rounded-2xl overflow-hidden">
          <MapaSucursales
            sucursales={todasLasSucursales}
            userLocation={userLocation}
            selectedLocation={selectedLocation}
          />
        </div>

        <div className="bg-white p-5 border rounded-2xl shadow-sm h-[500px] flex flex-col">
          <h2 className="font-semibold mb-3 border-b pb-2 text-lg">Tiendas disponibles ({todasLasSucursales.length})</h2>
          <ul className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {todasLasSucursales.map((s: any) => (
              <li
                key={s.id}
                onClick={() => setSelectedLocation([s.lat, s.lng])}
                className="cursor-pointer text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border-l-4 border-blue-500"
              >
                <p className="font-bold text-gray-900">{s.nombre}</p>
                <p className="text-gray-500">{s.direccion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
