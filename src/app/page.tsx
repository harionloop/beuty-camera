'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useCamera, FilterSettings } from '@/hooks/useCamera';
import FilterSliders from '@/components/FilterSliders';
import Gallery from '@/components/Gallery';
import ConfirmModal from '@/components/ConfirmModal';
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
  cinematic: {
    brightness: 0.95, contrast: 1.15, saturate: 0.9, hue: 0, blur: 0.2, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
    exposure: -0.1, temperature: -10, tint: 5, vibrance: 5, shadow: 25, highlight: -20, gamma: 1.15, noise: 1
  },
  warm: {
    brightness: 1.05, contrast: 1.05, saturate: 1.1, hue: 5, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.15, temperature: 30, tint: 10, vibrance: 15, shadow: 5, highlight: 5, gamma: 1.05, noise: 0
  },
  cool: {
    brightness: 1.02, contrast: 1.08, saturate: 1.05, hue: 200, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.1, temperature: -25, tint: -10, vibrance: 10, shadow: 10, highlight: -5, gamma: 1.05, noise: 0
  },
  dramatic: {
    brightness: 0.92, contrast: 1.35, saturate: 1.2, hue: 0, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 10,
    exposure: -0.15, temperature: 5, tint: 0, vibrance: 25, shadow: 40, highlight: -35, gamma: 1.25, noise: 0
  },
  soft: {
    brightness: 1.08, contrast: 0.92, saturate: 1.05, hue: 0, blur: 0.8, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.2, temperature: 8, tint: 5, vibrance: 8, shadow: -15, highlight: 20, gamma: 0.9, noise: 0
  },
  retro: {
    brightness: 1.02, contrast: 1.1, saturate: 0.75, hue: 15, blur: 0.3, scale: 1,
    sepia: 25, grayscale: 0, invert: 0, opacity: 1, sharpen: 3,
    exposure: 0.05, temperature: 25, tint: -8, vibrance: -15, shadow: 15, highlight: -10, gamma: 0.95, noise: 3
  },
  neon: {
    brightness: 1.1, contrast: 1.2, saturate: 1.8, hue: 180, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 15,
    exposure: 0.2, temperature: -20, tint: 20, vibrance: 50, shadow: 0, highlight: 30, gamma: 1.1, noise: 0
  },
  moody: {
    brightness: 0.88, contrast: 1.2, saturate: 0.8, hue: 0, blur: 0.5, scale: 1,
    sepia: 0, grayscale: 15, invert: 0, opacity: 1, sharpen: 5,
    exposure: -0.25, temperature: -15, tint: 5, vibrance: -5, shadow: 35, highlight: -25, gamma: 1.2, noise: 2
  },
  golden: {
    brightness: 1.06, contrast: 1.08, saturate: 1.15, hue: 30, blur: 0, scale: 1,
    sepia: 15, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.18, temperature: 40, tint: 15, vibrance: 20, shadow: 10, highlight: 15, gamma: 1.08, noise: 0
  },
  pastel: {
    brightness: 1.15, contrast: 0.88, saturate: 0.7, hue: 0, blur: 1.0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 0.98, sharpen: 0,
    exposure: 0.35, temperature: 12, tint: 8, vibrance: -10, shadow: -20, highlight: 25, gamma: 0.88, noise: 0
  },
  cyberpunk: {
    brightness: 1.05, contrast: 1.3, saturate: 1.4, hue: 240, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 20,
    exposure: 0.1, temperature: -30, tint: 30, vibrance: 40, shadow: 20, highlight: -15, gamma: 1.3, noise: 1
  },
  sunset: {
    brightness: 1.08, contrast: 1.12, saturate: 1.3, hue: 20, blur: 0.2, scale: 1,
    sepia: 10, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.25, temperature: 35, tint: 20, vibrance: 25, shadow: 5, highlight: 20, gamma: 1.1, noise: 0
  },
  monochrome: {
    brightness: 1.0, contrast: 1.2, saturate: 0, hue: 0, blur: 0, scale: 1,
    sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 8,
    exposure: 0, temperature: 0, tint: 0, vibrance: 0, shadow: 20, highlight: -15, gamma: 1.15, noise: 1
  },
  ethereal: {
    brightness: 1.12, contrast: 0.9, saturate: 1.1, hue: 0, blur: 1.5, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 0.92, sharpen: 0,
    exposure: 0.4, temperature: 10, tint: 12, vibrance: 12, shadow: -25, highlight: 30, gamma: 0.85, noise: 0
  },
  dark: {
    brightness: 0.85, contrast: 1.25, saturate: 0.9, hue: 0, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
    exposure: -0.3, temperature: -5, tint: 0, vibrance: 5, shadow: 45, highlight: -40, gamma: 1.3, noise: 2
  },
  bright: {
    brightness: 1.2, contrast: 1.05, saturate: 1.2, hue: 0, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0.4, temperature: 15, tint: 5, vibrance: 30, shadow: -30, highlight: 35, gamma: 0.95, noise: 0
  },
  film: {
    brightness: 0.98, contrast: 1.15, saturate: 0.95, hue: 5, blur: 0.4, scale: 1,
    sepia: 20, grayscale: 0, invert: 0, opacity: 1, sharpen: 8,
    exposure: -0.05, temperature: 15, tint: -3, vibrance: 8, shadow: 20, highlight: -15, gamma: 1.1, noise: 4
  },
  pop: {
    brightness: 1.1, contrast: 1.15, saturate: 1.6, hue: 10, blur: 0, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
    exposure: 0.2, temperature: 10, tint: 5, vibrance: 45, shadow: 0, highlight: 15, gamma: 1.05, noise: 0
  },
  matte: {
    brightness: 1.0, contrast: 0.95, saturate: 0.85, hue: 0, blur: 0.5, scale: 1,
    sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
    exposure: 0, temperature: 0, tint: 0, vibrance: -5, shadow: 10, highlight: -10, gamma: 0.98, noise: 0
  },
};

export default function Home() {
  const { videoRef, canvasRef, isActive, filters, setFilters, startCamera, stopCamera, capture } = useCamera();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [mirrorImage, setMirrorImage] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

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

      // Capture with mirror option
      const blob = await capture(mirrorImage);
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
  }, [capture, filters, isActive, mirrorImage]);

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
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        type={confirmModal.type}
      />
      <div className="h-screen w-screen flex bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#252b45] text-[#f0f4f8] overflow-hidden relative">
        {/* Animated background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/10 via-transparent to-[#ec4899]/10 animate-pulse pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)] pointer-events-none"></div>
        {/* Left Section - 70% - Camera & Filters */}
        <div className="w-[70%] flex flex-col p-6 gap-4 overflow-hidden relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f59e0b] rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-[#a855f7] via-[#ec4899] to-[#f59e0b] p-2.5 rounded-xl">
                  <span className="text-2xl">📷</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent drop-shadow-lg">
                BeautyCam
              </h1>
            </div>
            <div className="text-xs text-white/70 bg-gradient-to-r from-white/10 to-white/5 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm shadow-lg">
              Local-only · Camera required
            </div>
          </div>

          {/* Camera Viewer - Takes most of the space */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f1419]/90 via-[#1a1f35]/80 to-[#0f1419]/90 border-2 border-white/20 shadow-2xl min-h-0 group backdrop-blur-sm"
            style={{
              boxShadow: '0 20px 60px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
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
              className="px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#a855f7] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white border-none shadow-lg shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/60 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>▶</span>
                <span>Start Camera</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-br from-white/10 to-white/5 text-white/90 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              ⏹ Stop Camera
            </button>
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="px-7 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#f59e0b] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white border-none shadow-lg shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/60 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>📸</span>
                <span>Capture</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            {/* Mirror Toggle */}
            <label className="flex gap-2 items-center ml-auto bg-gradient-to-br from-white/10 to-white/5 px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-lg">
              <input
                type="checkbox"
                checked={mirrorImage}
                onChange={(e) => setMirrorImage(e.target.checked)}
                className="cursor-pointer accent-purple-500"
              />
              <span className="text-xs font-medium">🪞 Mirror Image</span>
            </label>
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-white/90 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-[#a855f7] to-[#ec4899] rounded-full"></span>
              <span>Presets ({Object.keys(PRESETS).length})</span>
            </div>
            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => handlePreset(key)}
                  className="px-3.5 py-2 rounded-lg bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm border border-white/15 text-xs hover:bg-gradient-to-br hover:from-white/15 hover:to-white/8 hover:border-white/25 hover:scale-105 active:scale-95 transition-all duration-200 capitalize font-medium shadow-md hover:shadow-lg"
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
        <div className="w-[30%] border-l border-white/20 bg-gradient-to-br from-white/8 via-white/5 to-transparent p-4 overflow-hidden flex flex-col backdrop-blur-md shadow-2xl relative z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 via-transparent to-[#ec4899]/5 pointer-events-none"></div>
          <div className="relative z-10 h-full">
            <Gallery onShowConfirm={showConfirm} />
          </div>
        </div>
      </div>
    </>
  );
}
