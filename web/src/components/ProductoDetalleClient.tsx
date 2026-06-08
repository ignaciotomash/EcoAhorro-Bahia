'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import type { ProductoDetalleData } from '../services/productoDetalle';

export default function ProductoDetalleClient({ producto }: { producto: ProductoDetalleData }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const [mostrarEnUSD, setMostrarEnUSD] = useState(false);

  const handleAdd = () => {
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

  // SVG chart dimensions
  const svgW = 600;
  const svgH = 250;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = svgW - pad.left - pad.right;
  const chartH = svgH - pad.top - pad.bottom;

  const vals = historialFiltrado.map(h => mostrarEnUSD ? h.precioUSD! : h.precioPromedio);

  const rawMin = Math.min(...vals);
  const rawMax = Math.max(...vals);
  const range = rawMax - rawMin;
  const padding = range * 5 || 1;
  const minV = Math.max(0, rawMin - padding);
  const maxV = rawMax + padding;

  const x = (i: number) => pad.left + (i / Math.max(historialFiltrado.length - 1, 1)) * chartW;
  const y = (v: number) => pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const linePoints = historialFiltrado.map((h, i) => `${x(i)},${y(vals[i])}`).join(' ');

  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const v = minV + (maxV - minV) * (i / gridCount);
    return {
      y: pad.top + (i / gridCount) * chartH,
      label: mostrarEnUSD ? Number(v.toFixed(2)) : Math.round(v),
    };
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* HERO */}
        <div className="flex flex-col md:flex-row">
          {/* LEFT: Image */}
          <div className="md:w-1/2 relative h-72 md:h-[500px] bg-gray-50 overflow-hidden flex items-center justify-center">
            {producto.imagen ? (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="object-contain w-full h-full p-4"
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
              <div className="mt-3 md:mt-4">
                <span className="inline-block text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-900/5 text-gray-600">
                  {producto.categoria}
                </span>
              </div>

              <div className="mt-4 md:mt-6 space-y-2.5">
                {producto.preciosPorSuper.map((p, i) => (
                  <div
                    key={p.supermercado}
                    className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${i === 0
                      ? 'bg-green-50 border-green-200 shadow-sm'
                      : 'bg-gray-50 border-gray-100'
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">{p.supermercado}</span>
                      {i === 0 && (
                        <span className="text-[9px] md:text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          Mejor precio
                        </span>
                      )}
                    </div>
                    <span className="text-lg md:text-2xl font-black text-gray-900 ml-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      ${p.precio.toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
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
            📈 HISTORIAL DE PRECIOS
          </h2>
          <p className="text-[10px] md:text-sm text-gray-400 mb-4 md:mb-6">Evolución del precio promedio en los últimos meses</p>

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
              onClick={() => setMostrarEnUSD(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mostrarEnUSD
                ? 'bg-[#1A237E] text-white shadow'
                : 'bg-gray-100 text-gray-500'
                }`}
            >
              USD
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-8">
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
              </defs>
              <polygon
                points={`${x(0)},${pad.top + chartH} ${linePoints} ${x(historialFiltrado.length - 1)},${pad.top + chartH}`}
                fill="url(#areaGrad)"
              />

              {/* Line */}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#1A237E"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots */}
              {historialFiltrado.map((h, i) => (
                <g key={i}>
                  <circle cx={x(i)} cy={y(vals[i])} r={4} fill="#FF6B35" stroke="white" strokeWidth={2} />
                  <text x={x(i)} y={y(vals[i]) - 10} textAnchor="middle" className="text-[11px]" fill="#374151" fontWeight="600">
                    {mostrarEnUSD ? 'USD ' : '$'}{mostrarEnUSD ? vals[i].toFixed(2) : vals[i].toLocaleString('es-AR')}
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {historialFiltrado.map((h, i) => (
                <text key={i} x={x(i)} y={svgH - 8} textAnchor="middle" className="text-[12px]" fill="#9CA3AF">
                  {h.fecha}
                </text>
              ))}
            </svg>
          </div>
        </section>
      </div>
    </main>
  );
}
