'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useCamera, FilterSettings } from '@/hooks/useCamera';
import { useTheme } from '@/hooks/useTheme';
import FilterSliders from '@/components/FilterSliders';
import Gallery from '@/components/Gallery';
import PresetCategories from '@/components/PresetCategories';
import ConfirmModal from '@/components/ConfirmModal';
import ThemeToggle from '@/components/ThemeToggle';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [mirrorImage, setMirrorImage] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [isPresetsCollapsed, setIsPresetsCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(70); // Initial width percentage
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    if (isScreenTorchOn) {
      document.body.classList.add("screen-torch-effect");
    } else {
      document.body.classList.remove("screen-torch-effect");
    }
  }, [isScreenTorchOn]);

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "info" = "info",
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
      toast.success("Camera started!");
    } catch {
      toast.error("Unable to access camera. Please allow camera permissions.");
    }
  };

  const handleCapture = useCallback(async () => {
    if (!isActive) {
      toast.error("Please start the camera first");
      return;
    }

    try {
      // Flash animation
      if (flashRef.current) {
        gsap.fromTo(
          flashRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.05, yoyo: true, repeat: 1 },
        );
      }

      // Canvas shake and zoom animation
      if (canvasContainerRef.current) {
        gsap
          .timeline()
          .to(canvasContainerRef.current, { scale: 1.02, duration: 0.1 })
          .to(canvasContainerRef.current, {
            x: -5,
            duration: 0.05,
            yoyo: true,
            repeat: 3,
          })
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
      toast.success("Image captured!", {
        icon: "✨",
        duration: 2500,
        style: {
          background: "linear-gradient(45deg, var(--accent), var(--accent2))",
          color: "#fff",
          borderRadius: "12px",
          padding: "14px 22px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        },
      });

      window.dispatchEvent(new Event("photoAdded"));

      // Upload in background (silently)
      try {
        const form = new FormData();
        form.append("file", blob, `beautycam_${Date.now()}.jpg`);

        const resp = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });

        const data = await resp.json();
        if (!resp.ok) {
          console.error("Cloudinary upload failed", data);
          return;
        }

        if (data?.result) {
          try {
            await updatePhoto(id, {
              cloudinaryUrl: data.result.url,
              cloudinaryPublicId: data.result.publicId,
            });
            window.dispatchEvent(new Event("photoAdded"));
          } catch (e) {
            console.warn(
              "Could not update local photo with Cloudinary metadata",
              e,
            );
          }
        }
      } catch (uploadErr) {
        console.error("Cloudinary upload failed", uploadErr);
      }
    } catch (err) {
      console.error("Capture failed", err);
      toast.error("Failed to capture photo. Make sure the camera is active.");
    }
  }, [capture, filters, isActive, mirrorImage]);

  const handlePreset = (
    preset: Partial<FilterSettings>,
    presetName: string,
  ) => {
    const nextFilters = { ...filters, ...preset };
    gsap.to(filters, {
      ...preset,
      duration: 0.5,
      ease: "power3.inOut",
      onUpdate: () => {
        setFilters({ ...filters, ...preset });
      },
      onComplete: () => {
        setFilters(nextFilters);
      },
    });
    setActivePreset(presetName);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        handleCapture();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCapture]);

  //Auto Capture Hack!
  const [captureCount, setCaptureCount] = useState(0);
  useEffect(() => {
    if (captureCount < 10) {
      setTimeout(() => {
        setCaptureCount(captureCount + 1);
        handleCapture();
      }, 5000);
    }
  }, [captureCount]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = previewWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth =
        startWidth + ((e.clientX - startX) / window.innerWidth) * 100;
      setPreviewWidth(Math.max(20, Math.min(80, newWidth))); // Clamp width
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
      <div
        className="min-h-dvh w-screen flex flex-col lg:flex-row lg:h-dvh overflow-x-hidden overflow-y-auto lg:overflow-hidden relative main-container"
        style={{
          "--preview-width": `${previewWidth}%`,
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        } as React.CSSProperties}
      >
        {/* Background decoration — adapts to theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20" style={{ background: isDark ? 'radial-gradient(circle, #8b4a2a 0%, transparent 70%)' : 'radial-gradient(circle, #fde0cc 0%, transparent 70%)' }}></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: isDark ? 'radial-gradient(circle, #6b3520 0%, transparent 70%)' : 'radial-gradient(circle, #fdd9c6 0%, transparent 70%)' }}></div>
        </div>

        {/* Left Section - Camera & Filters */}
        <div
          className="w-full lg:w-[var(--preview-width)] flex flex-col p-4 lg:p-6 gap-4 relative z-10 main-section shrink-0 lg:flex-1 lg:min-h-0"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl" style={{ background: "linear-gradient(135deg, #f4a07a, #e07b54)", boxShadow: "0 4px 12px rgba(224,123,84,0.3)" }}>
                <span className="text-2xl">📸</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--accent3)", letterSpacing: "-0.5px" }}>
                BeautyCam
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs px-3 py-1.5 rounded-full header-info font-medium" style={{ background: "var(--accent-lighter)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Local-First
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Camera Viewer */}
          <div
            ref={canvasContainerRef}
            className="camera-preview relative w-full shrink-0 aspect-[4/3] min-h-[220px] sm:min-h-[280px] lg:aspect-auto lg:flex-1 lg:min-h-0 rounded-2xl overflow-hidden group"
            style={{
              border: "1px solid var(--border)",
              background: isDark ? '#1e1008' : '#f5ede6',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(180,100,60,0.1)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isActive ? "opacity-0" : "opacity-100"}`}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-500"
              style={{
                display: isActive ? "block" : "none",
                opacity: isActive ? 1 : 0,
              }}
            />

            <div
              ref={flashRef}
              className="absolute inset-0 bg-white pointer-events-none opacity-0"
            />

            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-5">
                <div>
                  <div className="text-5xl mb-4 opacity-40">📷</div>
                  <div className="text-lg mb-1 font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Camera is Off
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Click <strong style={{ color: "var(--accent)" }}>Start Camera</strong> to begin
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2.5 flex-wrap items-center controls-container">
            <button
              onClick={handleStartCamera}
              disabled={isActive}
              className="btn-glow pulse-on-hover px-5 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #68c97b, #4ab060)", boxShadow: "0 3px 10px rgba(74,176,96,0.3)" }}
            >
              ▶ Start
            </button>
            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="btn-glow px-5 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #e8826e, #d45c44)", boxShadow: "0 3px 10px rgba(212,92,68,0.3)" }}
            >
              ⏹ Stop
            </button>
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="btn-glow pulse-on-hover px-6 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #e07b54, #c85e38)", boxShadow: "0 3px 12px rgba(224,123,84,0.4)" }}
            >
              📸 Capture
            </button>

            <label className="flex gap-2 items-center ml-auto px-4 py-2 rounded-full border cursor-pointer transition-all duration-200 mirror-label" style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={mirrorImage}
                onChange={(e) => setMirrorImage(e.target.checked)}
                className="cursor-pointer w-3.5 h-3.5"
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="text-xs font-medium">🪞 Mirror</span>
            </label>

            <button
              onClick={toggleScreenTorch}
              disabled={!isActive}
              className="btn-glow px-3.5 py-2 rounded-full border transition-all duration-300 disabled:opacity-40"
              style={isScreenTorchOn
                ? { background: "#fbbf24", borderColor: "#f59e0b", color: "#7c3700", fontWeight: 600 }
                : { background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }
              }
            >
              <span className="text-base">{isScreenTorchOn ? "💡" : "🔦"}</span>
            </button>
          </div>

          {/* Presets & Filters Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsPresetsCollapsed(!isPresetsCollapsed)}
              className="text-left text-xs font-semibold transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {isPresetsCollapsed ? "▶ Show Presets" : "▼ Hide Presets"}
            </button>
            <button
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className="text-left text-xs font-semibold transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {isFiltersCollapsed ? "▶ Show Filters" : "▼ Hide Filters"}
            </button>
          </div>

          {/* Collapsible Sections */}
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {!isPresetsCollapsed && (
              <PresetCategories
                onPresetSelect={handlePreset}
                activePreset={activePreset}
              />
            )}
            {!isFiltersCollapsed && (
              <FilterSliders filters={filters} onFilterChange={setFilters} />
            )}
          </div>
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-2 cursor-col-resize transition-colors duration-300 resizer hidden lg:flex items-center justify-center"
          style={{ background: "var(--border)" }}
        >
          <div className="h-16 w-0.5 rounded-full" style={{ background: "var(--accent2)" }}></div>
        </div>

        {/* Right Section - Gallery */}
        <div
          className="w-full lg:w-[calc(100%_-_var(--preview-width))] p-4 lg:p-6 flex flex-col relative z-10 gallery-section shrink-0 min-h-[50vh] lg:flex-1 lg:min-h-0"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}
        >
          <div className="relative z-10 h-full">
            <Gallery onShowConfirm={showConfirm} />
          </div>
        </div>
      </div>
    </>
  );
}
