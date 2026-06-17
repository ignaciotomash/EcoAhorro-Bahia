'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type DetectionState = 'idle' | 'scanning' | 'detected' | 'error';

function isValidEAN13(ean: string): boolean {
  if (!/^\d{13}$/.test(ean)) return false;
  const digits = ean.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}

const BARCODE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'];

export function useBarcodeDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onDetected: (ean: string) => void,
  sampleInterval = 500,
) {
  const [state, setState] = useState<DetectionState>('idle');
  const workerRef = useRef<Worker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<any>(null);
  const stoppedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supportsNative = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const detectFrame = useCallback(async () => {
    if (stoppedRef.current) return;
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    if (supportsNative) {
      try {
        if (!detectorRef.current) {
          const BarcodeDetectorClass = (window as any).BarcodeDetector;
          detectorRef.current = new BarcodeDetectorClass({ formats: BARCODE_FORMATS });
        }
        const barcodes = await detectorRef.current.detect(canvas);
        if (barcodes.length > 0 && !stoppedRef.current) {
          const raw = barcodes[0].rawValue as string;
          if (isValidEAN13(raw) || /^\d{8}$/.test(raw)) {
            stoppedRef.current = true;
            setState('detected');
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(200);
            }
            onDetected(raw);
            return;
          }
        }
      } catch {
        // Fall through to worker
      }
    }

    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(new URL('../../../workers/barcodeWorker', import.meta.url));
        workerRef.current.onmessage = (e: MessageEvent) => {
          if (stoppedRef.current) return;
          if (e.data.ean) {
            const raw = e.data.ean as string;
            if (isValidEAN13(raw) || /^\d{8}$/.test(raw)) {
              stoppedRef.current = true;
              setState('detected');
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(200);
              }
              onDetected(raw);
            }
          }
        };
      } catch {
        setState('error');
        return;
      }
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    workerRef.current.postMessage(
      { data: imageData.data.buffer, width: imageData.width, height: imageData.height },
      [imageData.data.buffer],
    );
  }, [videoRef, onDetected, supportsNative]);

  useEffect(() => {
    if (!enabled) {
      setState('idle');
      return;
    }

    stoppedRef.current = false;
    setState('scanning');

    const startTimeout = setTimeout(() => {
      detectFrame();
      intervalRef.current = setInterval(detectFrame, sampleInterval);
    }, 300);

    return () => {
      clearTimeout(startTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stoppedRef.current = true;
      setState('idle');
    };
  }, [enabled, detectFrame, sampleInterval]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { state };
}
