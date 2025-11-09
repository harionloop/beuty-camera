'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useCamera, FilterSettings } from '@/hooks/useCamera';
import FilterSliders from '@/components/FilterSliders';
import Gallery from '@/components/Gallery';
import PresetCategories from '@/components/PresetCategories';
import ConfirmModal from '@/components/ConfirmModal';
import { savePhoto, updatePhoto, PhotoMeta } from '@/lib/indexeddb';
import { gsap } from 'gsap';
import { toast } from 'react-hot-toast';


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

  const handlePreset = (preset: FilterSettings) => {
    // Animate filter change
    gsap.to({}, {
      duration: 0.3,
      onComplete: () => {
        setFilters(preset);
      }
    });
    setFilters(preset);
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
      <div className="h-screen w-screen flex flex-col lg:flex-row bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#252b45] text-[#f0f4f8] overflow-hidden relative">
        {/* Animated background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/10 via-transparent to-[#ec4899]/10 animate-pulse pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)] pointer-events-none"></div>
        {/* Left Section - 70% - Camera & Filters */}
        <div className="w-full lg:w-[70%] flex flex-col p-3 sm:p-4 lg:p-6 gap-2 sm:gap-3 lg:gap-4 overflow-hidden relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f59e0b] rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-[#a855f7] via-[#ec4899] to-[#f59e0b] p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl">
                  <span className="text-lg sm:text-2xl">📷</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent drop-shadow-lg">
                BeautyCam
              </h1>
            </div>
            <div className="text-[10px] sm:text-xs text-white/70 bg-gradient-to-r from-white/10 to-white/5 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 backdrop-blur-sm shadow-lg">
              <span className="hidden sm:inline">Local-only · Camera required</span>
              <span className="sm:hidden">Camera required</span>
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
          <div className="flex gap-2 sm:gap-3 flex-wrap items-center">
            <button
              onClick={handleStartCamera}
              disabled={isActive}
              className="px-3 sm:px-6 py-2 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#a855f7] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white border-none shadow-lg shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/60 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                <span>▶</span>
                <span className="hidden sm:inline">Start Camera</span>
                <span className="sm:hidden">Start</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="px-3 sm:px-6 py-2 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold bg-gradient-to-br from-white/10 to-white/5 text-white/90 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              <span className="hidden sm:inline">⏹ Stop Camera</span>
              <span className="sm:hidden">⏹ Stop</span>
            </button>
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="px-4 sm:px-7 py-2 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#f59e0b] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white border-none shadow-lg shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/60 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                <span>📸</span>
                <span className="hidden sm:inline">Capture</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            {/* Mirror Toggle */}
            <label className="flex gap-1.5 sm:gap-2 items-center ml-auto bg-gradient-to-br from-white/10 to-white/5 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-lg">
              <input
                type="checkbox"
                checked={mirrorImage}
                onChange={(e) => setMirrorImage(e.target.checked)}
                className="cursor-pointer accent-purple-500 w-3 h-3 sm:w-4 sm:h-4"
              />
              <span className="text-[10px] sm:text-xs font-medium">
                <span className="hidden sm:inline">🪞 Mirror Image</span>
                <span className="sm:hidden">🪞</span>
              </span>
            </label>
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-2">
            <PresetCategories onPresetSelect={handlePreset} />
          </div>

          {/* Filters Section - Scrollable */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <FilterSliders filters={filters} onFilterChange={setFilters} />
          </div>
        </div>

        {/* Right Section - 30% - Gallery */}
        <div className="w-full lg:w-[30%] border-t lg:border-t-0 lg:border-l border-white/20 bg-gradient-to-br from-white/8 via-white/5 to-transparent p-3 sm:p-4 overflow-hidden flex flex-col backdrop-blur-md shadow-2xl relative z-10 h-[40vh] lg:h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 via-transparent to-[#ec4899]/5 pointer-events-none"></div>
          <div className="relative z-10 h-full">
            <Gallery onShowConfirm={showConfirm} />
          </div>
        </div>
      </div>
    </>
  );
}
