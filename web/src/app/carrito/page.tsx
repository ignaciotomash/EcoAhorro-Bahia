import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CarritoPage from '@/features/carrito/components/CarritoPage';
import { getSupermercados } from '@/features/supermercados/services/supermercadoService';

export const dynamic = 'force-dynamic';

export default async function CarritoPageWrapper() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/carrito/acceso');
  }

  const supermercados = await getSupermercados();
  return <CarritoPage supermercados={supermercados} />;
}
