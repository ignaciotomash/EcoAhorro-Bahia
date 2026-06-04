import HomeClient from '../components/HomeClient';
import { getProductosCatalogo, getSupermercadosCount } from '../services/db';

export const revalidate = 3600; // Revalida la home cada 1 hora

export default async function HomePage() {
  const { productos, totalProductos } = await getProductosCatalogo(1, 10);
  const totalSupermercados = await getSupermercadosCount();
  return <HomeClient productosLocales={productos} totalProductos={totalProductos} totalSupermercados={totalSupermercados} />;
}