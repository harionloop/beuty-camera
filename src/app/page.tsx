'use client';

import { useState, useEffect } from 'react';
import { useCamera, FilterSettings } from '@/hooks/useCamera';
import FilterSliders from '@/components/FilterSliders';
import Gallery from '@/components/Gallery';
import { savePhoto, PhotoMeta } from '@/lib/indexeddb';

const PRESETS: Record<string, FilterSettings> = {
  natural: { brightness: 1, contrast: 1, saturate: 1, hue: 0, blur: 0, scale: 1 },
  smooth: { brightness: 1.05, contrast: 0.98, saturate: 1.06, hue: 0, blur: 1.6, scale: 1.03 },
  glam: { brightness: 1.08, contrast: 1.12, saturate: 1.2, hue: 6, blur: 0.6, scale: 1.05 },
  vintage: { brightness: 0.98, contrast: 0.9, saturate: 0.85, hue: 10, blur: 0.1, scale: 1 },
  'high-contrast': { brightness: 1, contrast: 1.25, saturate: 1.1, hue: 0, blur: 0, scale: 1.02 },
};

export default function Home() {
  const { videoRef, canvasRef, isActive, filters, setFilters, startCamera, stopCamera, capture } = useCamera();
  const [autoCapture, setAutoCapture] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoInterval, setAutoInterval] = useState<NodeJS.Timeout | null>(null);

  const handleStartCamera = async () => {
    try {
      await startCamera();
    } catch (err) {
      alert('Unable to access camera. Please allow camera permissions or use a compatible device.');
    }
  };

  const handleCapture = async () => {
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
      await savePhoto(blob, meta);
      window.dispatchEvent(new Event('photoAdded'));
    } catch (err) {
      console.error('Capture failed', err);
      alert('Failed to capture photo. Make sure the camera is active.');
    }
  };

  const handlePreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setFilters(preset);
    }
  };

  const startAutoCapture = () => {
    if (!autoEnabled) {
      alert('Please check "Enable Auto-Capture" first.');
      return;
    }
    if (autoInterval) return;
    handleCapture();
    const interval = setInterval(() => {
      handleCapture();
    }, 3000);
    setAutoInterval(interval);
    setAutoCapture(true);
  };

  const stopAutoCapture = () => {
    if (autoInterval) {
      clearInterval(autoInterval);
      setAutoInterval(null);
    }
    setAutoCapture(false);
  };

  useEffect(() => {
    if (!autoEnabled) {
      stopAutoCapture();
    }
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
  }, [filters]);

  useEffect(() => {
    return () => {
      stopAutoCapture();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 gap-7 bg-gradient-to-br from-[#0f1724] to-[#102236] text-[#e6eef8]">
      <div className="bg-gradient-to-b from-white/20 to-white/10 rounded-2xl shadow-2xl p-[18px] w-[920px] max-w-[calc(100%-48px)] grid grid-cols-[1fr_420px] gap-4 border border-white/35">
        {/* Left: Camera Section */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2.5 items-center">
            <h2 className="m-0 text-xl font-semibold">BeautyCam</h2>
            <div className="ml-auto text-xs text-white/60">Local-only · Camera required</div>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#0a0c14]/60 to-[#0a0c14]/40 min-h-[360px] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover block ${isActive ? 'hidden' : ''}`}
            />
            <canvas
              ref={canvasRef}
              className="preview absolute inset-0 w-full h-full object-cover block scale-x-[-1]"
              style={{ display: isActive ? 'block' : 'none' }}
            />
            {!isActive && (
              <div className="absolute text-white/50 text-center p-5">
                <div className="text-xl mb-2">Camera not started</div>
                <div className="text-xs text-white/60">
                  Grant camera permission and click <strong>Start Camera</strong>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap items-center mt-2">
            <button
              onClick={handleStartCamera}
              disabled={isActive}
              className="px-3.5 py-2.5 rounded-[10px] cursor-pointer font-semibold bg-gradient-to-r from-[#7c5cff] to-[#5ad7ff] text-[#06101a] border-none shadow-lg shadow-[#7c5cff]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Start Camera
            </button>
            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="px-3.5 py-2.5 rounded-[10px] cursor-pointer font-semibold bg-gradient-to-r from-white/30 to-white/10 text-white/70 border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Stop Camera
            </button>
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="px-3.5 py-2.5 rounded-[10px] cursor-pointer font-semibold bg-gradient-to-r from-[#7c5cff] to-[#5ad7ff] text-[#06101a] border-none shadow-lg shadow-[#7c5cff]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Capture
            </button>

            <label className="flex gap-2 items-center ml-auto">
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-xs">Enable Auto-Capture</span>
            </label>

            <button
              onClick={autoCapture ? stopAutoCapture : startAutoCapture}
              disabled={!autoEnabled}
              className={`px-3.5 py-2.5 rounded-[10px] cursor-pointer font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                autoCapture
                  ? 'bg-gradient-to-r from-[#ff7b7b] to-[#ffb47b] text-[#211]'
                  : 'bg-gradient-to-r from-white/30 to-white/10 text-white/70 border border-white/40 hover:bg-white/20'
              }`}
            >
              {autoCapture ? 'Stop Auto' : 'Start Auto'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-white/70 mb-1.5">Presets</div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(PRESETS).map(([key, _]) => (
                  <div
                    key={key}
                    onClick={() => handlePreset(key)}
                    className="bg-white/40 backdrop-blur-sm px-2.5 py-2 rounded-[10px] cursor-pointer border border-white/30 text-xs hover:bg-white/50 transition-colors"
                  >
                    {key === 'high-contrast' ? 'High Contrast' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/60">
                Auto-capture interval: <strong>3 seconds</strong>
              </div>
              <div className="text-xs text-white/60">
                Images saved locally in browser (IndexedDB)
              </div>
            </div>
          </div>

          <FilterSliders filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Right: Gallery Section */}
        <div className="flex flex-col gap-3">
          <Gallery />
        </div>
      </div>
    </div>
  );
}
