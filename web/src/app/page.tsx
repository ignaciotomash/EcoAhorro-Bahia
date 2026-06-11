import HomeClient from '@/features/productos/components/HomeClient';
import { getProductosCatalogo, getSupermercadosCount } from '@/features/productos/services/catalogoService';

export const revalidate = 3600; // Revalida la home cada 1 hora

export default async function HomePage() {
  const [{ productos, totalProductos }, totalSupermercados] = await Promise.all([
    getProductosCatalogo(1, 10),
    getSupermercadosCount(),
  ]);
  return <HomeClient productosLocales={productos} totalProductos={totalProductos} totalSupermercados={totalSupermercados} />;
}