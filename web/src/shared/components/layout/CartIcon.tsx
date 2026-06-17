'use client';

import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/features/carrito/context/CartContext';
import { useCatalogPaginationVisibility } from '@/shared/hooks/useCatalogPaginationVisibility';

export default memo(function CartIcon() {
  const { totalItems, isLoadingCart } = useCart();
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const isCatalogPaginationVisible = useCatalogPaginationVisibility();
  const isCartRoute = pathname.startsWith('/carrito');
  const [pulse, setPulse] = useState(false);
  const isResolvingCart = !isLoaded || isLoadingCart;
  const cartHref = isLoaded && !isSignedIn ? '/carrito/acceso' : '/carrito';
  const className = 'fixed bottom-4 right-4 z-50 flex md:hidden items-center gap-2 text-white px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200';
  const style = {
    backgroundColor: '#1A237E',
    boxShadow: '0 4px 20px rgba(26,35,126,0.35)',
    transform: pulse ? 'scale(1.08)' : 'scale(1)',
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: '0.3px',
  };

  useEffect(() => {
    if (!isResolvingCart && totalItems > 0) {
      setPulse(true);
      const timeoutId = window.setTimeout(() => setPulse(false), 400);
      return () => window.clearTimeout(timeoutId);
    }
  }, [isResolvingCart, totalItems]);

  if (isCartRoute || isCatalogPaginationVisible) {
    return null;
  }

  const content = (
    <>
      {isResolvingCart ? (
        <>
          <span className="h-4 w-4 md:h-5 md:w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          <span className="hidden md:inline">CARGANDO</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="hidden md:inline">
            {totalItems > 0 ? `${totalItems} PRODUCTO${totalItems !== 1 ? 'S' : ''}` : 'MI CARRITO'}
          </span>
          <span className="md:hidden">{totalItems > 0 ? totalItems : 'Carrito'}</span>
        </>
      )}

      {!isResolvingCart && totalItems > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 rounded-full text-[9px] md:text-[10px] font-black flex items-center justify-center text-white border-2 border-white"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </>
  );

  if (isResolvingCart) {
    return (
      <button
        type="button"
        disabled
        aria-label="Cargando carrito"
        className={`${className} disabled:cursor-wait`}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={cartHref} aria-label="Ver carrito" className={className} style={style}>
      {content}
    </Link>
  );
});
