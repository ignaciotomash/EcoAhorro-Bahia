'use client';

import React, { useEffect, useState } from 'react';
import { useCamera } from '@/features/productos/hooks/useCamera';
import { useBarcodeDetection } from '@/features/productos/hooks/useBarcodeDetection';

type Props = {
  onDetected: (ean: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const { videoRef, status, error, torchSupported, setTorch, startCamera, stopCamera, retry } = useCamera();
  const [torchOn, setTorchOn] = useState(false);
  const { state: detectionState } = useBarcodeDetection(videoRef, status === 'ready', onDetected);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleTorch = async () => {
    const next = !torchOn;
    await setTorch(next);
    setTorchOn(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-sm mx-4">
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

        <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-64 h-40 rounded-xl"
              style={{
                border: `2px solid ${detectionState === 'detected' ? '#16a34a' : '#E8920A'}`,
                boxShadow: `0 0 0 9999px ${detectionState === 'detected' ? 'rgba(22,163,74,0.4)' : 'rgba(0,0,0,0.5)'}`,
              }}
            />
          </div>

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
            }}
          />

          {status === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
              <div className="text-white text-sm font-semibold">Iniciando cámara...</div>
            </div>
          )}
        </div>

        {torchSupported && (
          <button
            onClick={handleTorch}
            className="mt-3 w-14 h-14 rounded-full bg-black/50 hover:bg-black/60 border border-white/30 transition-all flex items-center justify-center mx-auto"
            title={torchOn ? 'Apagar linterna' : 'Encender linterna'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={torchOn ? '#E8920A' : 'none'} stroke={torchOn ? '#E8920A' : 'white'} strokeWidth={2} className="h-6 w-6">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </button>
        )}

        {status === 'error' && (
          <div className="mt-4 bg-red-900 text-red-200 text-sm px-4 py-3 rounded-xl text-center space-y-2">
            <p>{error}</p>
            <button
              onClick={retry}
              className="bg-red-700 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        <p className="text-gray-400 text-xs text-center mt-4">
          El escaneo es automático al detectar el código
        </p>
      </div>
    </div>
  );
}
