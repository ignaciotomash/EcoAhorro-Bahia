import CatalogoClient from '@/features/productos/components/CatalogoClient';
import { getProductosCatalogo, getCategorias } from '@/features/productos/services/catalogoService';

export const revalidate = 3600; // ISR para el catálogo

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string; search?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const queryCategorias = params.categoria?.split(',').filter(Boolean) || [];
  const searchQuery = params.search || '';
  const limit = 24;

  const categorias = await getCategorias();
  const selectedCategorias = queryCategorias
    .map((value) => {
      const match = categorias.find(cat => cat.id === value || cat.nombre === value);
      return match?.id;
    })
    .filter((id): id is string => Boolean(id));

  const initialData = await getProductosCatalogo(
    currentPage,
    limit,
    selectedCategorias.length > 0 ? selectedCategorias : undefined,
    undefined,
    undefined,
    undefined,
    searchQuery
  );

  return (
    <CatalogoClient
      categorias={categorias}
      initialSelectedCategorias={selectedCategorias}
      initialData={initialData}
      initialPage={currentPage}
      initialSearch={searchQuery}
    />
  );
}
