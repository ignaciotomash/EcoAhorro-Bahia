'use client';

import React from 'react';
import Image from 'next/image';
import type { ProductoEnSuper } from '@/features/carrito/types';

type Props = {
  productos: ProductoEnSuper[];
};

export default function DesplegableProductos({ productos }: Props) {
  return (
    <div style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
      {productos.map((prod, j) => (
        <div key={prod.id} className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: j < productos.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
          <div className="flex items-center gap-2 min-w-0">
            {prod.imagen
              ? <Image src={prod.imagen} alt={prod.nombre} width={32} height={32}
                  className="rounded-lg object-contain bg-white flex-shrink-0 p-0.5 border border-gray-100" />
              : <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
            }
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{prod.nombre}</p>
              <p className="text-[10px] text-gray-400">{prod.cantidad} × ${prod.precio.toLocaleString('es-AR')}</p>
            </div>
          </div>
          <span className="text-xs font-black flex-shrink-0 ml-2" style={{ color: '#1A237E' }}>
            ${prod.subtotal.toLocaleString('es-AR')}
          </span>
        </div>
      ))}
    </div>
  );
}