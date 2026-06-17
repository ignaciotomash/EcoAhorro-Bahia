'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useCart } from '@/features/carrito/context/CartContext';

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onGoToPage: (value: string, reset: () => void) => void;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const maxVisible = 5;
  const safeTotal = Math.max(totalPages, 0);

  if (safeTotal <= maxVisible) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > safeTotal) {
    end = safeTotal;
    start = safeTotal - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function PageJumpInput({
  totalPages,
  onGoToPage,
  className,
  showSubmitButton = false,
}: {
  totalPages: number;
  onGoToPage: (value: string, reset: () => void) => void;
  className: string;
  showSubmitButton?: boolean;
}) {
  const [value, setValue] = useState('');
  const submitPage = () => {
    onGoToPage(value, () => setValue(''));
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        placeholder="Ir a..."
        value={value}
        maxLength={5}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            submitPage();
          }
        }}
        onChange={(event) => {
          setValue(event.currentTarget.value.replace(/[^0-9]/g, ''));
        }}
        className={className}
        title={`Ingresa un numero entre 1 y ${totalPages}`}
      />
      {showSubmitButton && (
        <button
          type="button"
          onClick={submitPage}
          className="px-2.5 py-2 rounded-xl font-bold text-white text-xs transition-all hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
          aria-label="Ir a la pagina ingresada"
        >
          Ir
        </button>
      )}
    </div>
  );
}

function CatalogMobileActions() {
  const { totalItems, isLoadingCart } = useCart();
  const { isLoaded, isSignedIn } = useUser();
  const isResolvingCart = !isLoaded || isLoadingCart;
  const cartHref = isLoaded && !isSignedIn ? '/carrito/acceso' : '/carrito';

  return (
    <div id="catalog-pagination-actions" className="mt-4 grid grid-cols-2 gap-2 md:hidden" role="group" aria-label="Acciones rapidas del catalogo">
      <Link
        href="/escaner"
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-offset-2"
        style={{ backgroundColor: '#FF6B35', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.3px' }}
        aria-label="Abrir escaner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3M15 4h2a2 2 0 012 2v3M7 4H5a2 2 0 00-2 2v3" />
        </svg>
        Escanear
      </Link>

      {isResolvingCart ? (
        <button
          type="button"
          disabled
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-white transition-all disabled:cursor-wait"
          style={{ backgroundColor: '#1A237E', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.3px' }}
          aria-label="Cargando carrito"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          Carrito
        </button>
      ) : (
        <Link
          href={cartHref}
          className="relative flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
          style={{ backgroundColor: '#1A237E', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.3px' }}
          aria-label="Ver carrito"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {totalItems > 0 ? `${totalItems} producto${totalItems !== 1 ? 's' : ''}` : 'Carrito'}
          {totalItems > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full px-1 text-center text-[9px] font-black leading-4 text-white border border-white"
              style={{ backgroundColor: '#FF6B35' }}
              aria-hidden="true"
            >
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}

export default function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
  onGoToPage,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav id="catalog-pagination" className="mt-6 md:mt-12 pb-4 md:pb-0" aria-label="Paginacion de productos">
      <div className="hidden md:flex flex-wrap justify-center items-center gap-2">
        {currentPage > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            className="min-w-10 px-3 py-2 rounded-xl font-bold text-white text-xs transition-all hover:opacity-90"
            style={{ backgroundColor: '#FF6B35' }}
            aria-label="Pagina anterior"
          >
            &larr;
          </button>
        )}

        {visiblePages.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`min-w-10 px-3 py-2 rounded-xl text-xs transition-all ${
              pageNum === currentPage
                ? 'font-bold text-white'
                : 'font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
            style={pageNum === currentPage ? { backgroundColor: '#1A237E' } : undefined}
            aria-current={pageNum === currentPage ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}

        {currentPage < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            className="min-w-10 px-3 py-2 rounded-xl font-bold text-white text-xs transition-all hover:opacity-90"
            style={{ backgroundColor: '#FF6B35' }}
            aria-label="Pagina siguiente"
          >
            &rarr;
          </button>
        )}

        {currentPage < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-xl font-semibold text-gray-600 bg-gray-100 text-xs transition-all hover:bg-gray-200"
            title="Ultima pagina"
            aria-label={`Ir a la ultima pagina ${totalPages}`}
          >
            {totalPages}
          </button>
        )}

        <PageJumpInput
          totalPages={totalPages}
          onGoToPage={onGoToPage}
          className="w-20 px-2 py-2 border border-gray-300 rounded-xl text-center text-xs focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-orange-100"
        />
      </div>

      <div className="flex md:hidden justify-center items-center gap-2">
        {currentPage > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            className="min-w-9 px-3 py-2 rounded-xl font-bold text-white text-xs transition-all hover:opacity-90"
            style={{ backgroundColor: '#FF6B35' }}
            aria-label="Pagina anterior"
          >
            &larr;
          </button>
        )}

        <span
          className="min-w-14 px-3 py-2 rounded-xl font-bold text-white text-xs text-center"
          style={{ backgroundColor: '#1A237E' }}
        >
          {currentPage}
        </span>

        {currentPage < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            className="min-w-9 px-3 py-2 rounded-xl font-bold text-white text-xs transition-all hover:opacity-90"
            style={{ backgroundColor: '#FF6B35' }}
            aria-label="Pagina siguiente"
          >
            &rarr;
          </button>
        )}

        <PageJumpInput
          totalPages={totalPages}
          onGoToPage={onGoToPage}
          className="w-16 px-2 py-2 border border-gray-300 rounded-xl text-center text-xs focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-orange-100"
          showSubmitButton
        />
      </div>

      <CatalogMobileActions />
    </nav>
  );
}
