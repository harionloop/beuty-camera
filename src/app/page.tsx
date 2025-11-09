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
  const {
    videoRef,
    canvasRef,
    isActive,
    filters,
    setFilters,
    startCamera,
    stopCamera,
    capture,
    isTorchOn,
    toggleTorch,
    isScreenTorchOn,
    toggleScreenTorch,
  } = useCamera();
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

  const [isPresetsCollapsed, setIsPresetsCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(70); // Initial width percentage
  const [activePreset, setActivePreset] = useState<string | null>(null);


  useEffect(() => {
    if (isScreenTorchOn) {
      document.body.classList.add('screen-torch-effect');
    } else {
      document.body.classList.remove('screen-torch-effect');
    }
  }, [isScreenTorchOn]);

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
          { opacity: 1, duration: 0.05, yoyo: true, repeat: 1 }
        );
      }

      // Canvas shake and zoom animation
      if (canvasContainerRef.current) {
        gsap.timeline()
          .to(canvasContainerRef.current, { scale: 1.02, duration: 0.1 })
          .to(canvasContainerRef.current, { x: -5, duration: 0.05, yoyo: true, repeat: 3 })
          .to(canvasContainerRef.current, { scale: 1, x: 0, duration: 0.2 });
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
        icon: '✨',
        duration: 2500,
        style: {
          background: 'linear-gradient(45deg, var(--accent), var(--accent2))',
          color: '#fff',
          borderRadius: '12px',
          padding: '14px 22px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
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

  const handlePreset = (preset: FilterSettings, presetName: string) => {
    gsap.to(filters, {
      ...preset,
      duration: 0.5,
      ease: 'power3.inOut',
      onUpdate: () => {
        setFilters({ ...filters });
      }
    });
    setActivePreset(presetName);
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

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = previewWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + ((e.clientX - startX) / window.innerWidth) * 100;
      setPreviewWidth(Math.max(20, Math.min(80, newWidth))); // Clamp width
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
      <div className="h-screen w-screen flex flex-col lg:flex-row bg-gradient-to-br from-[#1a1c2c] via-[#131523] to-[#0f101c] text-[#f0f4f8] overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-pink-500/10 animate-pulse pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_30%_20%,rgba(138,43,226,0.2),transparent_60%)] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_70%_80%,rgba(255,105,180,0.2),transparent_60%)] pointer-events-none"></div>
        
        {/* Left Section - Camera & Filters */}
        <div
          className="w-full flex flex-col p-4 lg:p-6 gap-4 overflow-hidden relative z-10"
          style={{ width: `${previewWidth}%` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="relative animated-border rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 p-3 rounded-xl">
                  <span className="text-3xl drop-shadow-lg">📸</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                BeautyCam
              </h1>
            </div>
            <div className="text-xs text-white/60 bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm shadow-lg">
              <span>Local-First & Privacy-Focused</span>
            </div>
          </div>

          {/* Camera Viewer */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 relative rounded-3xl overflow-hidden bg-black/30 border-2 border-white/10 shadow-2xl min-h-0 group backdrop-blur-sm animated-border"
            style={{
              boxShadow: '0 25px 50px -12px rgba(138, 43, 226, 0.25)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-500"
              style={{ display: isActive ? 'block' : 'none', opacity: isActive ? 1 : 0 }}
            />
            
            <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none opacity-0" />

            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60 text-center p-5">
                <div className="animate-pulse">
                  <div className="text-4xl mb-4">📷</div>
                  <div className="text-xl mb-2 font-semibold">Camera is Off</div>
                  <div className="text-md text-white/70">
                    Click <strong className="text-white/90">Start Camera</strong> to begin
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
              className="btn-glow pulse-on-hover px-6 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-green-400 to-cyan-500 text-white border-none shadow-lg shadow-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-cyan-500/50"
            >
              ▶ Start
            </button>
            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="btn-glow px-6 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white border-none shadow-lg shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-orange-500/50"
            >
              ⏹ Stop
            </button>
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="btn-glow pulse-on-hover px-7 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg shadow-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-pink-500/50"
            >
              📸 Capture
            </button>

            <label className="flex gap-2 items-center ml-auto bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-lg">
              <input
                type="checkbox"
                checked={mirrorImage}
                onChange={(e) => setMirrorImage(e.target.checked)}
                className="cursor-pointer accent-purple-500 w-4 h-4"
              />
              <span className="text-sm font-medium">🪞 Mirror</span>
            </label>

            <button
              onClick={toggleScreenTorch}
              disabled={!isActive}
              className={`btn-glow px-4 py-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm shadow-lg ${
                isScreenTorchOn
                  ? 'bg-yellow-400/90 border-yellow-300 text-black font-semibold'
                  : 'bg-black/20 border-white/10 text-white/80 hover:border-white/20'
              }`}
            >
              <span className="text-lg">{isScreenTorchOn ? '💡' : '🔦'}</span>
            </button>
          </div>

          {/* Presets & Filters Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsPresetsCollapsed(!isPresetsCollapsed)}
              className="text-left text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              {isPresetsCollapsed ? '▶ Show Presets' : '▼ Hide Presets'}
            </button>
            <button
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className="text-left text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              {isFiltersCollapsed ? '▶ Show Filters' : '▼ Hide Filters'}
            </button>
          </div>
          
          {/* Collapsible Sections */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {!isPresetsCollapsed && <PresetCategories onPresetSelect={handlePreset} activePreset={activePreset} />}
            {!isFiltersCollapsed && <FilterSliders filters={filters} onFilterChange={setFilters} />}
          </div>
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-2.5 cursor-col-resize bg-white/5 hover:bg-white/10 transition-colors duration-300 group"
        >
          <div className="h-full w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500 mx-auto opacity-50 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Right Section - Gallery */}
        <div
          className="w-full border-t-2 lg:border-t-0 lg:border-l-2 border-white/10 bg-black/20 p-4 lg:p-6 overflow-hidden flex flex-col backdrop-blur-lg shadow-inner-2xl relative z-10 h-[40vh] lg:h-auto"
          style={{ width: `${100 - previewWidth}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>
          <div className="relative z-10 h-full">
            <Gallery onShowConfirm={showConfirm} />
          </div>
        </div>
      </div>
    </>
  );
}
