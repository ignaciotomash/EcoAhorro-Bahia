'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/carrito/context/CartContext';
import { useUser, SignInButton } from '@clerk/nextjs';
import type { ProductoDetalleData } from '@/features/productos/types';
import { formatearNombreCategoria } from '@/shared/utils/format';

export default function ProductoDetalleClient({ producto }: { producto: ProductoDetalleData }) {
  const { addToCart, items } = useCart();
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [mostrarEnUSD, setMostrarEnUSD] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!showAuthWarning) return;
    const t = setTimeout(() => setShowAuthWarning(false), 3000);
    return () => clearTimeout(t);
  }, [showAuthWarning]);
  const categoriaFormateada = formatearNombreCategoria(producto.categoria);

  const [inflacion, setInflacion] = useState<{ fecha: string; valor: number }[] | null>(null);
  const [mostrarConInflacion, setMostrarConInflacion] = useState(false);
  const [inflacionLoading, setInflacionLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoUsdOpen, setInfoUsdOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    fetch('/api/inflacion', { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error('Error cargando inflación'); return r.json(); })
      .then(d => setInflacion(d.mensual))
      .catch(e => { if (e.name === 'AbortError') return; console.error(e); })
      .finally(() => setInflacionLoading(false));
    return () => ctrl.abort();
  }, []);

  const handleAdd = () => {
    if (isLoaded && !isSignedIn) { setShowAuthWarning(true); return; }
    addToCart({
      id: producto.ean,
      nombre: producto.nombre,
      marca: producto.marca,
      categoria: producto.categoria,
      imagen: producto.imagen ?? undefined,
      precios: producto.preciosPorSuper.map(p => ({
        super: p.supermercado,
        valor: p.precio,
      })),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const enCarrito = items.find(i => i.producto.id === producto.ean);
  const tienePrecio = producto.preciosPorSuper.length > 0;
  const historial = producto.historialPrecios;
  const historialFiltrado = mostrarEnUSD
    ? historial.filter(h => h.precioUSD !== undefined)
    : historial.filter(h => h.esReal);

  const indicesGraficados = useMemo(
    () => historialFiltrado.map((_, i) => i),
    [historialFiltrado]
  );

  const indicesLabels = useMemo(
    () => [0, historialFiltrado.length - 1],
    [historialFiltrado.length]
  );

  const indicesLabelsPrecio = useMemo(() => {
    if (historialFiltrado.length === 0) return [];
    if (!mostrarEnUSD) return indicesGraficados;
    const parseFecha = (f: string) => {
      const [d, m, y] = f.split('/').map(Number);
      return new Date(y, m - 1, d);
    };
    const t0 = parseFecha(historialFiltrado[0].fecha).getTime();
    const inds = historialFiltrado
      .map((h, i) => ({ i, dias: (parseFecha(h.fecha).getTime() - t0) / 86400000 }))
      .filter(({ dias }) => Math.round(dias) % 7 === 0)
      .map(({ i }) => i);
    if (!inds.includes(0)) inds.unshift(0);
    if (!inds.includes(historialFiltrado.length - 1)) inds.push(historialFiltrado.length - 1);
    return inds;
  }, [mostrarEnUSD, historialFiltrado, indicesGraficados]);

  // SVG chart dimensions
  const svgW = 600;
  const svgH = 250;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = svgW - pad.left - pad.right;
  const chartH = svgH - pad.top - pad.bottom;

  const preciosAjustados = useMemo(() => {
    if (!inflacion || !mostrarConInflacion) return null;
    return historialFiltrado.map((h, i) => {
      if (i === 0) return mostrarEnUSD ? (h.precioUSD ?? 0) : h.precioPromedio;
      const realAnterior = mostrarEnUSD
        ? (historialFiltrado[i - 1].precioUSD ?? 0)
        : historialFiltrado[i - 1].precioPromedio;
      const inflacionMes = inflacion[i - 1]?.valor ?? 0;
      return realAnterior * (1 + inflacionMes / 100);
    });
  }, [inflacion, mostrarConInflacion, historialFiltrado, mostrarEnUSD]);

  const vals = historialFiltrado.map(h => mostrarEnUSD ? h.precioUSD! : h.precioPromedio);
  const allVals = preciosAjustados ? [...vals, ...preciosAjustados] : vals;

  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const range = rawMax - rawMin;
  const padding = range * 2.5 || 1;
  const minV = Math.max(0, rawMin - padding);
  const maxV = rawMax + padding;

  const x = (i: number) => pad.left + (i / Math.max(historialFiltrado.length - 1, 1)) * chartW;
  const y = (v: number) => pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const linePoints = indicesGraficados.map(i => `${x(i)},${y(vals[i])}`).join(' ');

  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const v = maxV - (maxV - minV) * (i / gridCount);
    return {
      y: pad.top + (i / gridCount) * chartH,
      label: mostrarEnUSD ? Number(v.toFixed(2)) : Math.round(v),
    };
  });

  const mejorPrecio = producto.preciosPorSuper[0]?.precio ?? 0;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3 md:py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs md:text-sm font-semibold text-gray-500 hover:text-[#1A237E] transition-colors"
          >
            Volver
          </button>
        </div>

        {/* HERO */}
        <div className="flex flex-col md:flex-row">
          {/* LEFT: Image */}
          <div className="md:w-1/2 relative h-72 md:h-[500px] bg-gray-50 overflow-hidden flex items-center justify-center">
            {producto.imagen ? (
              <Image
                src={producto.imagen}
                alt={producto.nombre}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4"
              />
            ) : (
              <span className="text-gray-300 text-sm font-medium">Sin foto</span>
            )}
          </div>

          {/* RIGHT: Name, Prices + CTA */}
          <div className="md:w-1/2 p-4 md:p-8 flex flex-col justify-between">
            <div>
              {/* Product name & brand */}
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {producto.nombre}
              </h1>
              <p className="text-[9px] md:text-[10px] font-mono text-gray-300 mt-1">EAN: {producto.ean}</p>
              <div className="mt-3 md:mt-4">
                <span className="inline-block text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-900/5 text-gray-600">
                  {categoriaFormateada}
                </span>
              </div>

              <div className="mt-4 md:mt-6 space-y-2.5">
                {producto.preciosPorSuper.map((p, i) => {
                  const diff = i > 0 ? Math.round(((p.precio - mejorPrecio) / mejorPrecio) * 100) : 0;
                  const isHovered = hoveredIndex === i;
                  return (
                    <div
                      key={p.supermercado}
                      onPointerEnter={() => setHoveredIndex(i)}
                      onPointerLeave={() => setHoveredIndex(null)}
                      className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all cursor-pointer ${i === 0
                        ? 'bg-green-50 border-green-200 shadow-sm'
                        : isHovered
                          ? 'bg-red-50 border-red-300 shadow-sm'
                          : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs md:text-sm font-semibold truncate ${i > 0 && isHovered ? 'text-red-700' : 'text-gray-700'}`}>
                          {p.supermercado}
                        </span>
                        {i === 0 && (
                          <span className="text-[9px] md:text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Mejor precio
                          </span>
                        )}
                        {i > 0 && isHovered && (
                          <span className="text-[9px] md:text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                            +{diff}%
                          </span>
                        )}
                      </div>
                      <span className={`text-lg md:text-2xl font-black ml-3 ${i > 0 && isHovered ? 'text-red-700' : 'text-gray-900'}`} style={{ fontFamily: "'Oswald', sans-serif" }}>
                        ${p.precio.toLocaleString('es-AR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            {tienePrecio && (
              <button
                onClick={handleAdd}
                className="mt-6 md:mt-8 w-full py-3 md:py-4 rounded-xl text-sm md:text-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: added ? '#10B981' : '#1A237E',
                  transform: added ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                {added ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {enCarrito ? 'Agregar otro' : 'Lo quiero'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* PRICE HISTORY */}
        <section className="border-t border-gray-100 px-4 py-8 md:py-12">
          <h2 className="text-base md:text-xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
            HISTORIAL DE PRECIOS
          </h2>
          <p className="text-[10px] md:text-sm text-gray-400 mb-4 md:mb-6">Evolución del precio promedio en los últimos meses</p>

          {historialFiltrado.length > 0 ? (
            <>
              <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMostrarEnUSD(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!mostrarEnUSD
                ? 'bg-[#1A237E] text-white shadow'
                : 'bg-gray-100 text-gray-500'
                }`}
            >
              ARS $
            </button>
            <button
              onClick={() => { setMostrarEnUSD(true); setMostrarConInflacion(false); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mostrarEnUSD
                ? 'bg-[#1A237E] text-white shadow'
                : 'bg-gray-100 text-gray-500'
                }`}
            >
              USD
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-8 overflow-visible relative">
            {mostrarEnUSD && (
              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                <div
                  className="relative"
                  onMouseEnter={() => setInfoUsdOpen(true)}
                  onMouseLeave={() => setInfoUsdOpen(false)}
                  onClick={() => setInfoUsdOpen(!infoUsdOpen)}
                >
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                  {infoUsdOpen && (
                    <div className="absolute right-0 top-full mt-1 min-w-[220px] bg-white border border-gray-200 shadow-sm rounded-lg p-3 z-20 whitespace-normal"
                      onMouseEnter={() => setInfoUsdOpen(true)}
                      onMouseLeave={() => setInfoUsdOpen(false)}
                    >
                      <p className="text-sm font-semibold text-gray-700">Precio en USD</p>
                      <p className="text-xs text-gray-500 mt-1">Convertido desde ARS usando el tipo de cambio del día de cada registro.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!mostrarEnUSD && !inflacionLoading && (
              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                <button
                  onClick={() => setMostrarConInflacion(!mostrarConInflacion)}
                  className={`relative px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center ${mostrarConInflacion
                    ? 'bg-[#10B981] text-white shadow'
                    : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  Comparar inflación
                  <span className={`transition-all duration-300 overflow-hidden inline-flex items-center ${mostrarConInflacion ? 'opacity-100 w-4 ml-1' : 'opacity-0 w-0 ml-0'}`}>
                    <div
                      onMouseEnter={(e) => { e.stopPropagation(); setInfoOpen(true); }}
                      onMouseLeave={(e) => { e.stopPropagation(); setInfoOpen(false); }}
                      onClick={(e) => { e.stopPropagation(); setInfoOpen(!infoOpen); }}
                    >
                      <Info className="w-4 h-4 text-current cursor-pointer" />
                      {infoOpen && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 space-y-2 z-20"
                          onMouseEnter={() => setInfoOpen(true)}
                          onMouseLeave={() => setInfoOpen(false)}
                        >
                          <p><span className="inline-block w-3 h-0.5 rounded bg-[#1A237E] align-middle mr-1.5"></span><span className="font-semibold">Línea azul</span> — Precio real registrado</p>
                          <p><span className="inline-block w-3 h-0.5 rounded bg-[#10B981] align-middle mr-1.5"></span><span className="font-semibold">Línea verde punteada</span> — Precio teórico según índice de inflación mensual (INDEC)</p>
                        </div>
                      )}
                    </div>
                  </span>
                </button>
              </div>
            )}
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-48 md:h-64" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {gridLines.map((gl, i) => (
                <g key={i}>
                  <line x1={pad.left} y1={gl.y} x2={svgW - pad.right} y2={gl.y} stroke="#D1D5DB" strokeWidth={1.5} />
                  <text x={pad.left - 8} y={gl.y + 4} textAnchor="end" className="text-[12px]" fill="#9CA3AF">
                    {mostrarEnUSD ? 'USD ' : '$'}{gl.label.toLocaleString('es-AR')}
                    
                  </text>
                </g>
              ))}

              {/* Area under the line */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A237E" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#1A237E" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="areaGradVerde" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              {/* Areas */}
              {preciosAjustados && (
                <polygon
                  points={[
                    ...indicesGraficados.map(i => `${x(i)},${y(preciosAjustados[i])}`),
                    ...[...indicesGraficados].reverse().map(i => `${x(i)},${y(vals[i])}`)
                  ].join(' ')}
                  fill="url(#areaGradVerde)"
                />
              )}
              <polygon
                points={`${x(indicesGraficados[0])},${pad.top + chartH} ${linePoints} ${x(indicesGraficados[indicesGraficados.length - 1])},${pad.top + chartH}`}
                fill="url(#areaGrad)"
              />

              {/* Lines */}
              {preciosAjustados && (
                <polyline
                  points={indicesGraficados.map(i => `${x(i)},${y(preciosAjustados[i])}`).join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 3"
                />
              )}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#1A237E"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots (rendered last so always on top) */}
              {preciosAjustados && indicesGraficados.map(i => (
                <circle
                  key={`adj-${i}`} cx={x(i)} cy={y(preciosAjustados[i])} r={6}
                  fill="#10B981" stroke="white" strokeWidth={2}
                  className="cursor-pointer"
                  onPointerEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, label: `${historialFiltrado[i].fecha}: ${mostrarEnUSD ? 'USD ' : '$'}${preciosAjustados[i].toLocaleString('es-AR', { minimumFractionDigits: mostrarEnUSD ? 2 : 0, maximumFractionDigits: mostrarEnUSD ? 2 : 0 })} (teórico)` })}
                  onPointerLeave={() => setTooltip(null)}
                />
              ))}
              {indicesGraficados.map(i => (
                <g key={i}>
                  <circle
                    cx={x(i)} cy={y(vals[i])} r={6}
                    fill="#FF6B35" stroke="white" strokeWidth={2}
                    className="cursor-pointer"
                    onPointerEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, label: `${historialFiltrado[i].fecha}: ${mostrarEnUSD ? 'USD ' : '$'}${mostrarEnUSD ? vals[i].toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : vals[i].toLocaleString('es-AR')}` })}
                    onPointerLeave={() => setTooltip(null)}
                  />
                  {(!mostrarEnUSD || indicesLabelsPrecio.includes(i)) && (
                    <text x={x(i)} y={y(vals[i]) - 10} textAnchor="middle" className="text-[11px]" fill="#374151" fontWeight="600">
                      {mostrarEnUSD ? 'USD ' : '$'}{mostrarEnUSD ? vals[i].toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : vals[i].toLocaleString('es-AR')}
                    </text>
                  )}
                </g>
              ))}

              {/* X-axis labels */}
              {indicesLabels.map(i => (
                <text key={i} x={x(i)} y={svgH - 8} textAnchor="middle" className="text-[12px]" fill="#9CA3AF">
                  {historialFiltrado[i].fecha}
                </text>
              ))}
            </svg>
          </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <p className="text-sm text-gray-400">Este producto aún no tiene precios registrados.</p>
            </div>
          )}
        </section>

        {tooltip && (
          <div className="fixed bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none z-50 font-mono whitespace-nowrap"
            style={{
              left: tooltip.x + 160 > window.innerWidth ? tooltip.x - 160 : tooltip.x + 12,
              top: tooltip.y - 12,
            }}
          >
            {tooltip.label}
          </div>
        )}

      {showAuthWarning && (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-[999] pointer-events-none">
          <div className="px-4 md:px-6 py-2 md:py-3 rounded-lg text-[10px] md:text-xs font-semibold text-white shadow-lg animate-fadeIn pointer-events-auto flex items-center gap-3"
            style={{ backgroundColor: '#1A237E' }}>
            <span>Necesitás iniciar sesión para agregar productos al carrito</span>
            <SignInButton mode="modal">
              <button type="button" className="font-black underline whitespace-nowrap">
                Iniciar sesión
              </button>
            </SignInButton>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          `}</style>
        </div>
      )}
      </div>
    </main>
  );
}
