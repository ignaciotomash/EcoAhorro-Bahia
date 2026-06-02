import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import CartIcon from '../components/CartIcon';
import ClerkUserSync from '../components/ClerkUserSync';
import Navbar from '../components/Navbar';

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
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Oswald:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827' }}>
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
