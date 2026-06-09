'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  onDetected: (ean: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const readerRef = useRef<any>(null);

  useEffect(() => {
    let stopped = false;

    async function startScanner() {
      try {
        // Carga dinámica de zxing para evitar SSR issues
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        if (stopped) return;

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // Preferimos cámara trasera en mobile
        const devices = await reader.listVideoInputDevices();
        const backCamera = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('trasera') ||
          d.label.toLowerCase().includes('environment')
        );
        const deviceId = backCamera?.deviceId || devices[devices.length - 1]?.deviceId;

        setLoading(false);

        await reader.decodeFromVideoDevice(
          deviceId ?? undefined,
          videoRef.current!,
          (result, err) => {
            if (result && !stopped) {
              stopped = true;
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(200);
              }
              onDetected(result.getText());
            }
          }
        );
      } catch (e: any) {
        setError('No se pudo acceder a la cámara. Verificá los permisos.');
        setLoading(false);
      }
    }

    startScanner();

    return () => {
      stopped = true;
      readerRef.current?.reset();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-white font-bold text-sm">Apuntá al código de barras</p>
          <button
            onClick={onClose}
            className="text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Visor */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
          <video ref={videoRef} className="w-full h-full object-cover" />

          {/* Overlay de guía */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-64 h-40 rounded-xl"
              style={{
                border: '2px solid #E8920A',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
              }}
            />
          </div>

          {/* Línea de escaneo animada */}
          <style>{`
            @keyframes scan {
              0% { top: 20%; }
              50% { top: 75%; }
              100% { top: 20%; }
            }
            .scan-line {
              animation: scan 2s ease-in-out infinite;
            }
          `}</style>
          <div
            className="scan-line absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: '256px',
              height: '2px',
              backgroundColor: '#E8920A',
              opacity: 0.8,
              position: 'absolute',
            }}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
              <div className="text-white text-sm font-semibold">Iniciando cámara...</div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-900 text-red-200 text-sm px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <p className="text-gray-400 text-xs text-center mt-4">
          El escaneo es automático al detectar el código
        </p>
      </div>
    </div>
  );
}