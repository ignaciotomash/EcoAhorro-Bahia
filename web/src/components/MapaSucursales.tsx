'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = L.icon({
  iconUrl: "/ubicacion-usuario.png",   
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [50, 50],
  iconAnchor: [20, 50],
});

// Componente para recentrar el mapa suavemente
function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

interface Sucursal {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  direccion: string;
}

export default function MapaSucursales({ 
  sucursales, 
  userLocation 
}: { 
  sucursales: Sucursal[], 
  userLocation: [number, number] | null 
}) {
  const centroInicial: [number, number] = [-38.7183, -62.2663]; // Bahía Blanca

  return (
    <MapContainer 
      center={centroInicial} 
      zoom={13} 
      style={{ height: '500px', width: '100%', borderRadius: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Marcadores de Sucursales */}
      {sucursales.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={icon}>
          <Popup>
            <strong>{s.nombre}</strong><br />
            {s.direccion}
          </Popup>
        </Marker>
      ))}

      {/* Marcador del Usuario */}
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
          <RecenterMap coords={userLocation} />
        </>
      )}
    </MapContainer>
  );
}