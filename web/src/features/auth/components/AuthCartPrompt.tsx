'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';

export default function AuthCartPrompt() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div
      className="rounded-2xl p-4 md:p-5"
      style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
      }}
    >
      <p
        className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: '#FF6B35' }}
      >
        Cuenta Eco Ahorro
      </p>
      <h2
        className="text-base md:text-lg font-black leading-tight mb-2"
        style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}
      >
        Guardá tu carrito y no pierdas oportunidades de ahorro
      </h2>
      <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
        Iniciá sesión para conservar tus productos entre visitas y recibir avisos sobre mejores precios y ofertas relevantes.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <SignInButton mode="modal">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#1A237E' }}
          >
            Iniciar sesión
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all hover:bg-gray-100"
            style={{ color: '#1A237E', border: '1px solid #CBD5E1' }}
          >
            Crear cuenta
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}
