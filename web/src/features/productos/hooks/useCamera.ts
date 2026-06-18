'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraStatus = 'idle' | 'starting' | 'ready' | 'error';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const zoomCapabilitiesRef = useRef<{ min: number; max: number; step: number } | null>(null);

  const getTrack = useCallback(() => streamRef.current?.getVideoTracks()[0] ?? null, []);

  const stopCamera = useCallback(() => {
    const track = getTrack();
    if (track) {
      track.stop();
    }
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
    setError(null);
  }, [getTrack]);

  const startCamera = useCallback(async () => {
    setStatus('starting');
    setError(null);
    setTorchSupported(false);
    zoomCapabilitiesRef.current = null;

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
    } catch (e: any) {
      if (e.name === 'OverconstrainedError' || e.name === 'NotFoundError') {
        // Fallback: try any camera (useful on iOS/Safari where environment camera isn't available)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
        } catch (fallbackErr: any) {
          const message =
            fallbackErr.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Ajustá los permisos del navegador.'
              : fallbackErr.name === 'NotFoundError'
                ? 'No se encontró ninguna cámara.'
                : 'No se pudo acceder a la cámara. Verificá los permisos.';
          setError(message);
          setStatus('error');
          return;
        }
      } else {
        const message =
          e.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Ajustá los permisos del navegador.'
            : 'No se pudo acceder a la cámara. Verificá los permisos.';
        setError(message);
        setStatus('error');
        return;
      }
    }

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      try {
        await videoRef.current.play();
      } catch {
        // Some browsers (Safari) require autoplay or play after user interaction
        // We already try to play; if it fails, the stream is still attached
      }
    }

    const track = stream.getVideoTracks()[0];
    const caps: any = track.getCapabilities();
    if (caps.torch) setTorchSupported(true);
    if (caps.zoom) {
      zoomCapabilitiesRef.current = { min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step ?? 0.1 };
    }

    setStatus('ready');
  }, []);

  const setTorch = useCallback(async (on: boolean) => {
    const track = getTrack();
    if (!track || !(track.getCapabilities() as any)?.torch) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as any] });
    } catch {
      // Torch not supported at runtime
    }
  }, [getTrack]);

  const setZoom = useCallback(async (level: number) => {
    const track = getTrack();
    const cap = zoomCapabilitiesRef.current;
    if (!track || !cap) return;
    const clamped = Math.max(cap.min, Math.min(cap.max, level));
    try {
      await track.applyConstraints({ advanced: [{ zoom: clamped } as any] });
    } catch {
      // Zoom not supported at runtime
    }
  }, [getTrack]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const retry = useCallback(async () => {
    stopCamera();
    await startCamera();
  }, [stopCamera, startCamera]);

  return {
    videoRef,
    status,
    error,
    torchSupported,
    zoomRange: zoomCapabilitiesRef.current,
    setTorch,
    setZoom,
    startCamera,
    stopCamera,
    retry,
  };
}
