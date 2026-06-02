'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartIcon() {
  const { totalItems } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 400);
      return () => clearTimeout(t);
    }
  }, [totalItems]);

  return (
    <Link href="/carrito">
      <button
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2 md:gap-2.5 text-white px-3 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all duration-200"
        style={{
          backgroundColor: '#1A237E',
          boxShadow: '0 4px 20px rgba(26,35,126,0.35)',
          transform: pulse ? 'scale(1.08)' : 'scale(1)',
          fontFamily: "'Oswald', sans-serif",
          letterSpacing: '0.3px',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="hidden md:inline">{totalItems > 0 ? `${totalItems} PRODUCTO${totalItems !== 1 ? 'S' : ''}` : 'MI CARRITO'}</span>
        <span className="md:hidden">{totalItems > 0 ? totalItems : '🛒'}</span>
        {totalItems > 0 && (
          <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 rounded-full text-[9px] md:text-[10px] font-black flex items-center justify-center text-white border-2 border-white"
            style={{ backgroundColor: '#FF6B35' }}>
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>
    </Link>
  );
}