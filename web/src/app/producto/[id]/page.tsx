import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductoDetalle } from '@/features/productos/services/productoDetalleService';
import { findProductIdsWithPrices } from '@/features/productos/repositories/productoRepository';
import ProductoDetalleClient from '@/features/productos/components/ProductoDetalleClient';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const ids = await findProductIdsWithPrices(200);
  return ids.map((id) => ({ id }));
}

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