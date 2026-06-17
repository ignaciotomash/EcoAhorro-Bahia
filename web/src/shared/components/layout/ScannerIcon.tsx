'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCatalogPaginationVisibility } from '@/shared/hooks/useCatalogPaginationVisibility';

export default function ScannerIcon() {
  const pathname = usePathname();
  const isCatalogPaginationVisible = useCatalogPaginationVisibility();
  const isScannerRoute = pathname.startsWith('/escaner');

  if (isScannerRoute || isCatalogPaginationVisible) {
    return null;
  }

  return (
    <Link
      href="/escaner"
      aria-label="Abrir escaner"
      className="fixed bottom-4 left-4 z-50 flex md:hidden items-center gap-2 text-white px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 hover:opacity-90"
      style={{
        backgroundColor: '#FF6B35',
        boxShadow: '0 4px 20px rgba(255,107,53,0.35)',
        fontFamily: "'Oswald', sans-serif",
        letterSpacing: '0.3px',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3M15 4h2a2 2 0 012 2v3M7 4H5a2 2 0 00-2 2v3"
        />
      </svg>
      <span>ESCANER</span>
    </Link>
  );
}
