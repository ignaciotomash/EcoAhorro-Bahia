'use client';

import React from 'react';
import Image from 'next/image';
import type { ProductoFaltante } from '@/features/carrito/types';

type Props = {
  faltantes: ProductoFaltante[];
};

export default function DesplegableFaltantes({ faltantes }: Props) {
  return (
    <div style={{ backgroundColor: '#FFFBEB', borderTop: '1px solid #FEF3C7' }}>
      {faltantes.map((f, j) => (
        <div key={f.id} className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: j < faltantes.length - 1 ? '1px solid #FEF3C7' : 'none' }}>
          {f.imagen
            ? <Image src={f.imagen} alt={f.nombre} width={24} height={24}
                className="rounded-md object-contain bg-white flex-shrink-0 p-0.5 border border-amber-100" />
            : <div className="w-6 h-6 rounded-md bg-amber-100 flex-shrink-0" />
          }
          <p className="text-xs text-amber-800 truncate">{f.nombre}</p>
        </div>
      ))}
    </div>
  );
}