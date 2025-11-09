'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturate: number;
  hue: number;
  blur: number;
  scale: number;
  sepia: number;
  grayscale: number;
  invert: number;
  opacity: number;
  sharpen: number;
  exposure: number;
  temperature: number;
  tint: number;
  vibrance: number;
  shadow: number;
  highlight: number;
  gamma: number;
  noise: number;
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
    sepia: 0,
    grayscale: 0,
    invert: 0,
    opacity: 1,
    sharpen: 0,
    exposure: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0,
    shadow: 0,
    highlight: 0,
    gamma: 1,
    noise: 0,
  });

  const getFilterString = useCallback(() => {
    const { brightness, contrast, saturate, hue, blur, sepia, grayscale, invert, opacity, exposure, temperature, tint, vibrance, shadow, highlight, gamma } = filters;
    
    // Calculate exposure adjustment (exposure is in EV, convert to brightness multiplier)
    const exposureBrightness = Math.pow(2, exposure);
    const adjustedBrightness = brightness * exposureBrightness;
    
    // Temperature adjustment (warm/cool) - affects red/blue channels
    // Temperature: positive = warm (more red), negative = cool (more blue)
    const tempHue = temperature * 0.1; // Convert to hue shift
    
    // Tint adjustment (green/magenta)
    const tintHue = tint * 0.05;
    
    const filtersArray = [
      `blur(${blur}px)`,
      `brightness(${adjustedBrightness})`,
      `contrast(${contrast})`,
      `saturate(${saturate + vibrance * 0.1})`, // Combine saturation and vibrance
      `hue-rotate(${hue + tempHue + tintHue}deg)`,
      `sepia(${sepia}%)`,
      `grayscale(${grayscale}%)`,
      `invert(${invert}%)`,
      `opacity(${opacity})`,
    ];
    
    return filtersArray.join(' ');
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

    // Only set canvas dimensions once when video metadata is loaded, or if they changed
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    const { scale } = filters;
    const srcW = videoWidth;
    const srcH = videoHeight;
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
      const handleLoadedMetadata = () => {
        // Start preview loop when video is ready
        startPreviewLoop();
      };
      
      if (video.readyState >= 2) {
        // Video already loaded, start immediately
        startPreviewLoop();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
      
      const handlePlay = () => {
        startPreviewLoop();
      };
      video.addEventListener('play', handlePlay);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('play', handlePlay);
        stopPreviewLoop();
      };
    } else {
      stopPreviewLoop();
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

