'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useCamera, FilterSettings } from '@/hooks/useCamera';
import FilterSliders from '@/components/FilterSliders';
import Gallery from '@/components/Gallery';
import { savePhoto, updatePhoto, PhotoMeta } from '@/lib/indexeddb';
import { gsap } from 'gsap';
import { toast } from 'react-hot-toast';

const PRESETS: Record<string, FilterSettings> = {
  natural: { 
    brightness: 1, contrast: 1, saturate: 1, hue: 0, blur: 0, scale: 1, 
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0, temperature: 0, tint: 0, vibrance: 0, shadow: 0, highlight: 0, gamma: 1, noise: 0
  },
  smooth: { 
    brightness: 1.05, contrast: 0.98, saturate: 1.06, hue: 0, blur: 1.6, scale: 1.03, 
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.1, temperature: 5, tint: 0, vibrance: 10, shadow: 5, highlight: -5, gamma: 1, noise: 0
  },
  glam: { 
    brightness: 1.08, contrast: 1.12, saturate: 1.2, hue: 6, blur: 0.6, scale: 1.05, 
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.2, temperature: 10, tint: 5, vibrance: 20, shadow: 0, highlight: 10, gamma: 1.1, noise: 0
  },
  vintage: { 
    brightness: 0.98, contrast: 0.9, saturate: 0.85, hue: 10, blur: 0.1, scale: 1, 
    sepia: 35, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: -0.1, temperature: 20, tint: -5, vibrance: -10, shadow: 10, highlight: -15, gamma: 0.9, noise: 5
  },
  'high-contrast': { 
    brightness: 1, contrast: 1.25, saturate: 1.1, hue: 0, blur: 0, scale: 1.02, 
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0, temperature: 0, tint: 0, vibrance: 0, shadow: -20, highlight: 20, gamma: 1.2, noise: 0
  },
  noir: { 
    brightness: 0.9, contrast: 1.3, saturate: 0, hue: 0, blur: 0, scale: 1, 
    sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 0,
    exposure: -0.2, temperature: 0, tint: 0, vibrance: 0, shadow: 30, highlight: -30, gamma: 1.1, noise: 2
  },
  dreamy: { 
    brightness: 1.1, contrast: 0.95, saturate: 1.15, hue: 0, blur: 1.2, scale: 1, 
    sepia: 0, grayscale: 0, invert: 0, opacity: 0.95, sharpen: 0,
    exposure: 0.3, temperature: 15, tint: 10, vibrance: 15, shadow: -10, highlight: 15, gamma: 0.95, noise: 0
  },
  vibrant: { 
    brightness: 1.05, contrast: 1.1, saturate: 1.5, hue: 5, blur: 0, scale: 1, 
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.1, temperature: 5, tint: 0, vibrance: 30, shadow: 0, highlight: 0, gamma: 1, noise: 0
  },
};

export default function Home() {
  const { videoRef, canvasRef, isActive, filters, setFilters, startCamera, stopCamera, capture } = useCamera();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const handleStartCamera = async () => {
    try {
      await startCamera();
      toast.success('Camera started!');
    } catch {
      toast.error('Unable to access camera. Please allow camera permissions.');
    }
  };

  const handleCapture = useCallback(async () => {
    if (!isActive) {
      toast.error('Please start the camera first');
      return;
    }

    try {
      // Flash animation
      if (flashRef.current) {
        gsap.fromTo(flashRef.current, 
          { opacity: 0 },
          { opacity: 1, duration: 0.1, yoyo: true, repeat: 1 }
        );
      }

      // Canvas shake animation
      if (canvasContainerRef.current) {
        gsap.to(canvasContainerRef.current, {
          x: -5,
          duration: 0.05,
          yoyo: true,
          repeat: 5,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(canvasContainerRef.current, { x: 0 });
          }
        });
      }

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
      
      // Show success notification
      toast.success('Image captured!', {
        icon: '📸',
        duration: 2000,
        style: {
          background: 'rgba(124, 92, 255, 0.9)',
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
        },
      });

      window.dispatchEvent(new Event('photoAdded'));

      // Upload in background (silently)
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
      toast.error('Failed to capture photo. Make sure the camera is active.');
    }
  }, [capture, filters, isActive]);

  const handlePreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      // Animate filter change
      gsap.to({}, {
        duration: 0.5,
        onUpdate: () => {
          // Smooth transition could be added here
        },
        onComplete: () => {
          setFilters(preset);
          toast.success(`Applied ${presetKey} preset`, { duration: 1500 });
        }
      });
      setFilters(preset);
    }
  };

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

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-[#1a1f35] via-[#252b45] to-[#1a1f35] text-[#f0f4f8] overflow-hidden">
        {/* Left Section - 70% - Camera & Filters */}
        <div className="w-[70%] flex flex-col p-6 gap-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent animate-pulse">
              BeautyCam
            </h1>
            <div className="text-xs text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              Local-only · Camera required
            </div>
          </div>

          {/* Camera Viewer - Takes most of the space */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0f1419]/80 to-[#1a1f35]/60 border-2 border-white/10 shadow-2xl min-h-0 group"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300"
              style={{ display: isActive ? 'block' : 'none', opacity: isActive ? 1 : 0 }}
            />
            
            {/* Flash effect */}
            <div
              ref={flashRef}
              className="absolute inset-0 bg-white pointer-events-none opacity-0"
            />

            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-center p-5">
                <div className="animate-pulse">
                  <div className="text-3xl mb-3">📷</div>
                  <div className="text-lg mb-2 font-semibold">Camera not started</div>
                  <div className="text-sm text-white/60">
                    Grant camera permission and click <strong className="text-white/80">Start Camera</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={handleStartCamera}
              disabled={isActive}
              className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white border-none shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200"
            >
              ▶ Start Camera
            </button>
            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="px-5 py-3 rounded-xl font-semibold bg-white/10 text-white/80 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 hover:scale-105 transition-all duration-200"
            >
              ⏹ Stop Camera
            </button>
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#f59e0b] to-[#ec4899] text-white border-none shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              📸 Capture
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
                  className="px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-xs hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-200 capitalize"
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
        <div className="w-[30%] border-l border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 overflow-hidden flex flex-col backdrop-blur-sm">
          <Gallery />
        </div>
      </div>
  );
}
