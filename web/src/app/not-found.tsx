import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }} />

      <div className="relative z-10 text-center px-4">
        {/* Big 404 */}
        <h1 className="text-[120px] md:text-[200px] font-black leading-none select-none"
          style={{
            fontFamily: "'Oswald', sans-serif",
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.05em',
          }}
        >
          404
        </h1>

        {/* Message */}
        <div className="mb-8">
          <p className="text-[#FF6B35] text-lg md:text-2xl font-bold mb-2"
            style={{ fontFamily: "'Oswald', sans-serif" }}>
            PÁGINA NO ENCONTRADA
          </p>
          <p className="text-blue-200 text-sm md:text-base max-w-md mx-auto">
            La página que buscás no existe o fue movida.<br />
            Revisá la URL o volvé al inicio.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-lg"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al inicio
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:bg-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
