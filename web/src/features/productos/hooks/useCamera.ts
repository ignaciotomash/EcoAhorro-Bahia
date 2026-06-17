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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const track = stream.getVideoTracks()[0];
      const caps: any = track.getCapabilities();
      if (caps.torch) setTorchSupported(true);
      if (caps.zoom) {
        zoomCapabilitiesRef.current = { min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step ?? 0.1 };
      }

      setStatus('ready');
    } catch (e: any) {
      const message =
        e.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Ajustá los permisos del navegador.'
          : e.name === 'NotFoundError'
            ? 'No se encontró ninguna cámara.'
            : 'No se pudo acceder a la cámara. Verificá los permisos.';
      setError(message);
      setStatus('error');
    }
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
