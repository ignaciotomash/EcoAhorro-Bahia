import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductoDetalle } from '@/features/productos/services/productoDetalleService';
import ProductoDetalleClient from '@/features/productos/components/ProductoDetalleClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProductoDetalle((await params).id);
  if (!data) return { title: 'Producto no encontrado' };
  return { title: `${data.nombre} — Eco Ahorro Bahía` };
}

export default async function Page({ params }: Props) {
  const data = await getProductoDetalle((await params).id);
  if (!data) notFound();
  return <ProductoDetalleClient producto={data} />;
}