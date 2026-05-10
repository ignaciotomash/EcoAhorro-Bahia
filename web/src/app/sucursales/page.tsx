'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Importación dinámica para evitar errores de SSR con Leaflet
const MapaSucursales = dynamic(() => import('@/src/components/MapaSucursales'), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa...</div>
});

const SUCURSALES_HARDCODED = [
  { id: 1, nombre: "Vea - Capitán Martínez", lat: -38.7123, lng: -62.2543, direccion: "Capitán Martínez 1234" },
  { id: 2, nombre: "Cooperativa Obrera - Centro", lat: -38.7190, lng: -62.2620, direccion: "Zelarrayán 560" },
  { id: 3, nombre: "Carrefour - Shopping", lat: -38.6980, lng: -62.2450, direccion: "Av. Sarmiento 2153" },
];

export default function SucursalesPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
      <h1 className="text-2xl font-bold mb-4">Encuentra tu sucursal más cercana</h1>
      
      <button 
        onClick={handleGetLocation}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        📍 Usar mi ubicación actual
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 shadow-lg border rounded-xl overflow-hidden">
          <MapaSucursales sucursales={SUCURSALES_HARDCODED} userLocation={userLocation} />
        </div>

        <div className="bg-white p-4 border rounded-xl shadow-sm">
          <h2 className="font-semibold mb-3 border-b pb-2">Tiendas disponibles</h2>
          <ul className="space-y-3">
            {SUCURSALES_HARDCODED.map(s => (
              <li key={s.id} className="text-sm">
                <p className="font-medium">{s.nombre}</p>
                <p className="text-gray-500">{s.direccion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}