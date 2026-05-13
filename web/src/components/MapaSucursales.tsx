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

const iconCoope = L.icon({
  iconUrl: 'web/public/icono_coope.jpg', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const iconVea = L.icon({
  iconUrl: 'web/public/icono_vea.jpg',  
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const iconCarrefour = L.icon({
  iconUrl: 'web/public/icono_changoMas.jpg',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const iconBanderita = L.icon({
  iconUrl: 'web/public/icono_banderita.jpg',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
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
  supermercadoId: number;
}

export default function MapaSucursales({ 
  sucursales, 
  userLocation 
}: { 
  sucursales: Sucursal[], 
  userLocation: [number, number] | null 
}) {
  const centroInicial: [number, number] = [-38.7183, -62.2663]; // Bahía Blanca

  const getIcon = (id: number) => {
        
    switch (id) {
      case 1: return iconCarrefour;
      case 2: return iconCoope;
      case 3: return iconVea;
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
          <Marker position={userLocation} icon={icon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
          <RecenterMap coords={userLocation} />
        </>
      )}
    </MapContainer>
  );



}