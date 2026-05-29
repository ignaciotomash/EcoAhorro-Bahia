import React from 'react';
import CatalogoClient from '../../components/CatalogoClient';
import { getProductosCatalogo, getCategorias } from '../../services/db';

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const queryCategorias = params.categoria?.split(',').filter(Boolean) || [];
  const limit = 100;

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
    selectedCategorias.length > 0 ? selectedCategorias : undefined
  );

  return (
    <CatalogoClient
      categorias={categorias}
      initialSelectedCategorias={selectedCategorias}
      initialData={initialData}
      initialPage={currentPage}
    />
  );
}
