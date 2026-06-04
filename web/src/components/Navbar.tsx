'use client';

import React, { useState } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/sucursales', label: 'Sucursales' },
  ];

  return (
    <nav className="w-full sticky top-0 z-40 bg-white" style={{ borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Eco Ahorro Bahía" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div className="leading-none">
            <span className="text-xs sm:text-sm md:text-base font-black tracking-tight block" style={{ color: '#1A237E', fontFamily: "'Oswald', sans-serif" }}>
              ECO AHORRO
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-semibold tracking-widest uppercase text-gray-400 block mt-0.5">
              Bahía Blanca
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                color: pathname === l.href ? '#1A237E' : '#6B7280',
                backgroundColor: pathname === l.href ? '#EEF0FB' : 'transparent',
              }}
            >
              {l.label}
            </Link>
          ))}

          {/* Escáner — destacado */}
          <Link
            href="/escaner"
            className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#FF6B35', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.3px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3M15 4h2a2 2 0 012 2v3M7 4H5a2 2 0 00-2 2v3" />
            </svg>
            Escáner
          </Link>

          <div className="ml-3 flex items-center gap-2">
            {!isSignedIn && (
              <>
              <SignInButton mode="modal">
                <button
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-gray-100"
                  style={{ color: '#1A237E' }}
                >
                  Ingresar
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  className="px-3 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1A237E' }}
                >
                  Crear cuenta
                </button>
              </SignUpButton>
              </>
            )}

            {isSignedIn && (
              <UserButton />
            )}
          </div>
        </div>

        {/* Mobile: Hamburger only */}
        <div className="flex md:hidden items-center gap-2">
          {isSignedIn && (
            <UserButton />
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Menú"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                color: pathname === l.href ? '#1A237E' : '#6B7280',
                backgroundColor: pathname === l.href ? '#EEF0FB' : 'transparent',
              }}
            >
              {l.label}
            </Link>
          ))}

          {/* Escáner Mobile Option */}
          <Link
            href="/escaner"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all"
            style={{ backgroundColor: '#FF6B35', fontFamily: "'Oswald', sans-serif" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3M15 4h2a2 2 0 012 2v3M7 4H5a2 2 0 00-2 2v3" />
            </svg>
            Escáner
          </Link>

          {!isSignedIn && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <SignInButton mode="modal">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ color: '#1A237E', backgroundColor: '#EEF0FB' }}
                >
                  Ingresar
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all"
                  style={{ backgroundColor: '#1A237E' }}
                >
                  Crear cuenta
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
