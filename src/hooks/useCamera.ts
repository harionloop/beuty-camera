'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturate: number;
  hue: number;
  blur: number;
  scale: number;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 1,
    contrast: 1,
    saturate: 1,
    hue: 0,
    blur: 0,
    scale: 1,
  });

  const getFilterString = useCallback(() => {
    const { brightness, contrast, saturate, hue, blur } = filters;
    return `blur(${blur}px) brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
  }, [filters]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera start failed', err);
      throw err;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    stopPreviewLoop();
  }, []);

  const drawToCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const { scale } = filters;
    const srcW = video.videoWidth;
    const srcH = video.videoHeight;
    const drawW = Math.round(srcW / scale);
    const drawH = Math.round(srcH / scale);
    const sx = Math.max(0, Math.round((srcW - drawW) / 2));
    const sy = Math.max(0, Math.round((srcH - drawH) / 2));

    ctx.save();
    ctx.filter = getFilterString();
    // Draw without mirroring (CSS will handle mirroring for preview)
    ctx.drawImage(video, sx, sy, drawW, drawH, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [filters, getFilterString]);

  const startPreviewLoop = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    const loop = () => {
      drawToCanvas();
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);
  }, [drawToCanvas]);

  const stopPreviewLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const capture = useCallback(async (): Promise<Blob> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      throw new Error('Camera not ready');
    }

    drawToCanvas();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.92
      );
    });
  }, [drawToCanvas]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && isActive) {
      const handlePlay = () => startPreviewLoop();
      video.addEventListener('play', handlePlay);
      return () => {
        video.removeEventListener('play', handlePlay);
        stopPreviewLoop();
      };
    }
  }, [isActive, startPreviewLoop, stopPreviewLoop]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    filters,
    setFilters,
    startCamera,
    stopCamera,
    capture,
  };
}

