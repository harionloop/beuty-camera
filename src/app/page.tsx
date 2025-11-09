'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCamera, FilterSettings } from '@/hooks/useCamera';
import FilterSliders from '@/components/FilterSliders';
import Gallery from '@/components/Gallery';
import { savePhoto, updatePhoto, PhotoMeta } from '@/lib/indexeddb';

const PRESETS: Record<string, FilterSettings> = {
  natural: { brightness: 1, contrast: 1, saturate: 1, hue: 0, blur: 0, scale: 1, sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0 },
  smooth: { brightness: 1.05, contrast: 0.98, saturate: 1.06, hue: 0, blur: 1.6, scale: 1.03, sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0 },
  glam: { brightness: 1.08, contrast: 1.12, saturate: 1.2, hue: 6, blur: 0.6, scale: 1.05, sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0 },
  vintage: { brightness: 0.98, contrast: 0.9, saturate: 0.85, hue: 10, blur: 0.1, scale: 1, sepia: 35, grayscale: 0, invert: 0, opacity: 1, sharpen: 0 },
  'high-contrast': { brightness: 1, contrast: 1.25, saturate: 1.1, hue: 0, blur: 0, scale: 1.02, sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0 },
  noir: { brightness: 0.9, contrast: 1.3, saturate: 0, hue: 0, blur: 0, scale: 1, sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 0 },
  dreamy: { brightness: 1.1, contrast: 0.95, saturate: 1.15, hue: 0, blur: 1.2, scale: 1, sepia: 0, grayscale: 0, invert: 0, opacity: 0.95, sharpen: 0 },
  vibrant: { brightness: 1.05, contrast: 1.1, saturate: 1.5, hue: 5, blur: 0, scale: 1, sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0 },
};

export default function Home() {
  const { videoRef, canvasRef, isActive, filters, setFilters, startCamera, stopCamera, capture } = useCamera();
  const [autoCapture, setAutoCapture] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoInterval, setAutoInterval] = useState<NodeJS.Timeout | null>(null);

  const handleStartCamera = async () => {
    try {
      await startCamera();
    } catch {
      alert('Unable to access camera. Please allow camera permissions or use a compatible device.');
    }
  };

  const handleCapture = useCallback(async () => {
    try {
      const blob = await capture();
      const meta: PhotoMeta = {
        filters: {
          brightness: filters.brightness.toString(),
          contrast: filters.contrast.toString(),
          saturate: filters.saturate.toString(),
          hue: filters.hue.toString(),
          blur: filters.blur.toString(),
          scale: filters.scale.toString(),
        },
      };

      const id = await savePhoto(blob, meta);
      window.dispatchEvent(new Event('photoAdded'));

      try {
        const form = new FormData();
        form.append('file', blob, `beautycam_${Date.now()}.jpg`);

        const resp = await fetch('/api/upload', {
          method: 'POST',
          body: form,
        });

        const data = await resp.json();
        if (!resp.ok) {
          console.error('Cloudinary upload failed', data);
          return;
        }

        if (data?.result) {
          try {
            await updatePhoto(id, {
              cloudinaryUrl: data.result.url,
              cloudinaryPublicId: data.result.publicId,
            });
            window.dispatchEvent(new Event('photoAdded'));
          } catch (e) {
            console.warn('Could not update local photo with Cloudinary metadata', e);
          }
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload failed', uploadErr);
      }
    } catch (err) {
      console.error('Capture failed', err);
      alert('Failed to capture photo. Make sure the camera is active.');
    }
  }, [capture, filters]);

  const handlePreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setFilters(preset);
    }
  };

  const startAutoCapture = useCallback(() => {
    if (!autoEnabled) {
      alert('Please check "Enable Auto-Capture" first.');
      return;
    }
    setAutoInterval((prev) => {
      if (prev) return prev;
      handleCapture();
      const interval = setInterval(() => {
        handleCapture();
      }, 3000);
      setAutoCapture(true);
      return interval;
    });
  }, [autoEnabled, handleCapture]);

  const stopAutoCapture = useCallback(() => {
    setAutoInterval((prev) => {
      if (prev) {
        clearInterval(prev);
      }
      return null;
    });
    setAutoCapture(false);
  }, []);

  useEffect(() => {
    if (!autoEnabled) {
      if (autoInterval) {
        clearInterval(autoInterval);
        setAutoInterval(null);
        setAutoCapture(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        handleCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCapture]);

  useEffect(() => {
    return () => {
      stopAutoCapture();
    };
  }, [stopAutoCapture]);

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-[#0f1724] to-[#102236] text-[#e6eef8] overflow-hidden">
      {/* Left Section - 70% - Camera & Filters */}
      <div className="w-[70%] flex flex-col p-6 gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7c5cff] to-[#5ad7ff] bg-clip-text text-transparent">
            BeautyCam
          </h1>
          <div className="text-xs text-white/60">Local-only · Camera required</div>
        </div>

        {/* Camera Viewer - Takes most of the space */}
        <div className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-b from-[#0a0c14]/60 to-[#0a0c14]/40 border border-white/20 shadow-2xl min-h-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${isActive ? 'hidden' : ''}`}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            style={{ display: isActive ? 'block' : 'none' }}
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-center p-5">
              <div>
                <div className="text-2xl mb-2">📷 Camera not started</div>
                <div className="text-sm text-white/60">
                  Grant camera permission and click <strong>Start Camera</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={handleStartCamera}
            disabled={isActive}
            className="px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[#7c5cff] to-[#5ad7ff] text-[#06101a] border-none shadow-lg shadow-[#7c5cff]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Start Camera
          </button>
          <button
            onClick={stopCamera}
            disabled={!isActive}
            className="px-4 py-2.5 rounded-lg font-semibold bg-white/10 text-white/70 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Stop Camera
          </button>
          <button
            onClick={handleCapture}
            disabled={!isActive}
            className="px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[#7c5cff] to-[#5ad7ff] text-[#06101a] border-none shadow-lg shadow-[#7c5cff]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            📸 Capture
          </button>

          <label className="flex gap-2 items-center ml-auto">
            <input
              type="checkbox"
              checked={autoEnabled}
              onChange={(e) => setAutoEnabled(e.target.checked)}
              className="cursor-pointer"
            />
            <span className="text-xs">Auto-Capture</span>
          </label>

          <button
            onClick={autoCapture ? stopAutoCapture : startAutoCapture}
            disabled={!autoEnabled}
            className={`px-4 py-2.5 rounded-lg font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              autoCapture
                ? 'bg-gradient-to-r from-[#ff7b7b] to-[#ffb47b] text-[#211]'
                : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
            }`}
          >
            {autoCapture ? '⏹ Stop Auto' : '▶ Start Auto'}
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-white/80">Presets:</div>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => handlePreset(key)}
                className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-xs hover:bg-white/20 hover:border-white/30 transition-colors capitalize"
              >
                {key === 'high-contrast' ? 'High Contrast' : key}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Section - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <FilterSliders filters={filters} onFilterChange={setFilters} />
        </div>
      </div>

      {/* Right Section - 30% - Gallery */}
      <div className="w-[30%] border-l border-white/20 bg-gradient-to-b from-white/5 to-transparent p-4 overflow-hidden flex flex-col">
        <Gallery />
      </div>
    </div>
  );
}
