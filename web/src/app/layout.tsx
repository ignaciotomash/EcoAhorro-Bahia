import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { CartProvider } from '@/features/carrito/context/CartContext';
import CartIcon from '@/shared/components/layout/CartIcon';
import ClerkUserSync from '@/features/auth/components/ClerkUserSync';
import Navbar from '@/shared/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-oswald',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Eco Ahorro Bahía — Comparador de precios',
  description: 'Compará precios de supermercados en Bahía Blanca y ahorrá en tus compras.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`}>
      <body className="font-sans bg-white text-gray-900">
        <ClerkProvider>
          <ClerkUserSync />
          <CartProvider>
            <Navbar />
            {children}
            <CartIcon />
          </CartProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
