'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// --- ICONOS ---
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const iconCoope = L.icon({ 
  iconUrl: "/icono_coope.png",      
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const iconVea = L.icon({
  iconUrl: "/icono_vea.jpg",       
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const iconChangoMas = L.icon({
  iconUrl: '/icono_changoMas.png',  
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const iconBanderita = L.icon({
  iconUrl: '/icono_banderita.png',  
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// --- COMPONENTE AUXILIAR ---
function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 15); // Zoom un poco más cerca al seleccionar una tienda
  }, [coords, map]);
  return null;
}

import type { Sucursal } from '@/features/sucursales/types';

interface MapaProps {
  sucursales: Sucursal[];
  userLocation: [number, number] | null;
  selectedLocation: [number, number] | null; 
}

export default function MapaSucursales({ 
  sucursales, 
  userLocation,
  selectedLocation 
}: MapaProps) {
  const centroInicial: [number, number] = [-38.7183, -62.2663];

  const getIcon = (id: number) => {
    switch (id) {
      case 1: return iconCoope;
      case 2: return iconVea;
      case 3: return iconChangoMas;
      case 4: return iconBanderita;
    }
  };

  return (
    <MapContainer 
      center={centroInicial} 
      zoom={13} 
      style={{ height: '500px', width: '100%', borderRadius: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marcadores de Sucursales */}
      {sucursales.map((s) => (
        <Marker 
          key={s.id} 
          position={[s.lat, s.lng]} 
          icon={getIcon(s.supermercadoId)} 
        >
          <Popup>
            <strong>{s.nombre}</strong><br />
            {s.direccion}
          </Popup>
        </Marker>
      ))}

      {/* Marcador del Usuario */}
      {userLocation && (
        <>
          <Marker position={userLocation} icon={iconDefault}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
          <RecenterMap coords={userLocation} />
        </>
      )}

      {/* RECENTRAR AL HACER CLICK EN LA LISTA */}
      {selectedLocation && <RecenterMap coords={selectedLocation} />}
      
    </MapContainer>
  );
}