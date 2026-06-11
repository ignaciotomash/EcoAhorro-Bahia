import CarritoPage from '@/features/carrito/components/CarritoPage';
import { getSupermercados } from '@/features/supermercados/services/supermercadoService';

export default async function CarritoPageWrapper() {
  const supermercados = await getSupermercados();
  return <CarritoPage supermercados={supermercados} />;
}
