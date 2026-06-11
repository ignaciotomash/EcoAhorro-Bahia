import SucursalesPage from '@/features/sucursales/components/SucursalesPage';
import banderita from '@/features/sucursales/data/banderita.json';
import vea from '@/features/sucursales/data/vea.json';
import coope from '@/features/sucursales/data/coope.json';
import changoMas from '@/features/sucursales/data/changoMas.json';

export default function SucursalesWrapper() {
  const sucursales = [
    ...(banderita || []),
    ...(vea || []),
    ...(coope || []),
    ...(changoMas || []),
  ].map((s: any, index) => ({
    id: index + 1,
    nombre: s.nombre,
    direccion: s.direccion,
    lat: s.latitud,
    lng: s.longitud,
    supermercadoId: s.supermercadoId,
  }));

  return <SucursalesPage sucursales={sucursales} />;
}
