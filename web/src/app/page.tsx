import React from 'react';
import HomeClient from '../components/HomeClient';
import { getProductosCatalogo } from '../services/db';

export const revalidate = 3600; // Revalida la home cada 1 hora

export default async function HomePage() {
  const { productos } = await getProductosCatalogo(1, 10); // En la home solo necesitamos algunos
  return <HomeClient productosLocales={productos} />;
}