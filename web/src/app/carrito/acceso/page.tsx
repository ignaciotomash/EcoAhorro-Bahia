'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

const CART_REDIRECT_URL = '/carrito';

export default function CarritoAccesoPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace(CART_REDIRECT_URL);
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: '#EEF2FF', color: '#1A237E' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 2.25A1 1 0 0 0 5.75 17H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
            />
          </svg>
        </div>

        <p
          className="mb-2 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#FF6B35' }}
        >
          Eco Ahorro
        </p>

        <h1
          className="text-2xl md:text-3xl font-black leading-tight"
          style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}
        >
          Guarda tu carrito antes de continuar
        </h1>

        <p className="mt-3 text-sm md:text-base leading-relaxed text-gray-500">
          Inicia sesion o crea una cuenta para conservar tus productos, comparar precios cuando vuelvas y no perder lo que ya elegiste.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <SignInButton
            mode="modal"
            forceRedirectUrl={CART_REDIRECT_URL}
            fallbackRedirectUrl={CART_REDIRECT_URL}
            signUpForceRedirectUrl={CART_REDIRECT_URL}
            signUpFallbackRedirectUrl={CART_REDIRECT_URL}
          >
            <button
              type="button"
              className="w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#1A237E' }}
            >
              Iniciar sesion
            </button>
          </SignInButton>

          <SignUpButton
            mode="modal"
            forceRedirectUrl={CART_REDIRECT_URL}
            fallbackRedirectUrl={CART_REDIRECT_URL}
            signInForceRedirectUrl={CART_REDIRECT_URL}
            signInFallbackRedirectUrl={CART_REDIRECT_URL}
          >
            <button
              type="button"
              className="w-full rounded-xl px-5 py-3 text-sm font-bold transition-all hover:bg-gray-50"
              style={{ color: '#1A237E', border: '1px solid #CBD5E1' }}
            >
              Crear cuenta
            </button>
          </SignUpButton>
        </div>

        <Link
          href="/catalogo"
          className="mt-5 inline-block text-xs md:text-sm font-semibold text-gray-400 transition-colors hover:text-gray-600"
        >
          Seguir explorando productos
        </Link>
      </section>
    </main>
  );
}
