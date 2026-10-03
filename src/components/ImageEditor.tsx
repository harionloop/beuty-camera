'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface ImageEditorProps {
  imageUrl: string;
  imageId: number;
  onClose: () => void;
}

const STICKERS = [
  '⭐', '🌸', '🌺', '🌻', '🌷', '🦋',
  '💖', '💕', '💗', '💝', '💫', '✨',
  '🎀', '🎉', '🎊', '🎈', '🎁', '🎗',
  '😊', '😍', '🥰', '😎', '🤩', '😄',
  '🌈', '☀️', '🌙', '⚡', '❄️', '🔥',
  '🍓', '🍑', '🍒', '🌿', '🍀', '🌴',
];

const FRAMES = [
  { id: 'none', label: 'None', style: {} },
  { id: 'white', label: 'Classic White', style: { border: '14px solid #ffffff', boxShadow: '0 0 0 2px #e0d0c0, 0 8px 24px rgba(0,0,0,0.12)' } },
  { id: 'warm', label: 'Warm Linen', style: { border: '14px solid #f5e6d3', boxShadow: '0 0 0 2px #d4956a, 0 8px 24px rgba(0,0,0,0.1)' } },
  { id: 'gold', label: 'Golden Hour', style: { border: '10px solid #f4c060', boxShadow: '0 0 0 3px #e07b54, 0 8px 24px rgba(200,120,0,0.25)' } },
  { id: 'rose', label: 'Rose Bloom', style: { border: '10px solid #f9a8c9', boxShadow: '0 0 0 3px #e7768e, 0 8px 24px rgba(200,80,100,0.2)' } },
  { id: 'sage', label: 'Sage Garden', style: { border: '10px solid #b8d4b0', boxShadow: '0 0 0 3px #7aac72, 0 8px 24px rgba(80,140,80,0.18)' } },
  { id: 'dark', label: 'Noir Edge', style: { border: '10px solid #2a1a0e', boxShadow: '0 0 0 2px #5c3d2e, 0 8px 24px rgba(0,0,0,0.4)' } },
  { id: 'polaroid', label: 'Polaroid', style: { padding: '10px 10px 40px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' } },
];

function getShareLink(platform: string, shareUrl: string): string {
  const text = encodeURIComponent('Check out my BeautyCam photo! 📸✨');
  const links: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${text}`,
  };
  return links[platform] || '';
}

export default function ImageEditor({ imageUrl, imageId, onClose }: ImageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFrame, setActiveFrame] = useState('none');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tab, setTab] = useState<'frames' | 'stickers' | 'share'>('frames');

  const frameStyle = FRAMES.find(f => f.id === activeFrame)?.style || {};

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: `s-${Date.now()}-${Math.random()}`,
      emoji,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 36,
    };
    setStickers(prev => [...prev, newSticker]);
    toast.success(`${emoji} added! Drag to move.`, {
      duration: 1500,
      style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px', fontSize: '13px' }
    });
  };

  const removeSticker = (id: string) => setStickers(prev => prev.filter(s => s.id !== id));

  const onStickerMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(id);
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dx = ((e.clientX - dragOffset.x) / rect.width) * 100;
      const dy = ((e.clientY - dragOffset.y) / rect.height) * 100;
      setStickers(prev => prev.map(s => s.id === dragging
        ? { ...s, x: Math.max(0, Math.min(93, s.x + dx)), y: Math.max(0, Math.min(93, s.y + dy)) }
        : s
      ));
      setDragOffset({ x: e.clientX, y: e.clientY });
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, dragOffset]);

  const handleDownload = useCallback(async () => {
    try {
      const h2c = (await import('html2canvas')).default;
      const el = containerRef.current;
      if (!el) return;
      const canvas = await h2c(el, { useCORS: true, backgroundColor: null });
      const a = document.createElement('a');
      a.download = `beautycam_edited_${Date.now()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      toast.success('Saved!', { style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px' } });
    } catch {
      const a = document.createElement('a');
      a.href = imageUrl; a.download = `beautycam_${Date.now()}.jpg`; a.click();
      toast.success('Downloaded!', { style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px' } });
    }
  }, [imageUrl]);

  const handleShare = async (platform: string) => {
    if (platform === 'native' && typeof navigator.share !== 'undefined') {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], 'beautycam.jpg', { type: 'image/jpeg' });
        await navigator.share({ title: 'BeautyCam Photo', text: 'Check out my photo!', files: [file] });
        return;
      } catch { /* fallback */ }
    }
    const link = getShareLink(platform, imageUrl);
    if (link) window.open(link, '_blank', 'width=600,height=450');
    toast.success('Opening...', { icon: '🔗', style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px', fontSize: '13px' } });
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(imageUrl).then(() => {
        toast.success('URL copied!', { icon: '📋', style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px', fontSize: '13px' } });
      });
    }
  };

  const tabStyle = (t: string) => tab === t
    ? { background: 'var(--accent)', color: 'white', boxShadow: '0 2px 8px rgba(224,123,84,0.3)' }
    : { background: 'var(--accent-lighter)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(61,43,26,0.55)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col lg:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl fade-in-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '95vh' }}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
          style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}
        >✕</button>

        {/* Image Preview */}
        <div className="flex-1 flex items-center justify-center p-5 overflow-hidden" style={{ background: 'var(--bg-secondary)', minHeight: '260px' }}>
          <div
            ref={containerRef}
            className="relative select-none"
            style={{
              ...frameStyle,
              borderRadius: (activeFrame === 'none' || activeFrame === 'polaroid') ? '12px' : '4px',
              display: 'inline-block',
              maxWidth: '100%',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Edit"
              draggable={false}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: activeFrame === 'none' ? '8px' : '0' }}
            />
            {stickers.map(s => (
              <div key={s.id}
                onMouseDown={e => onStickerMouseDown(e, s.id)}
                className="absolute select-none group"
                style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.size}px`, cursor: dragging === s.id ? 'grabbing' : 'grab', zIndex: 10, lineHeight: 1 }}
              >
                {s.emoji}
                <button onClick={e => { e.stopPropagation(); removeSticker(s.id); }}
                  className="absolute -top-2.5 -right-2.5 w-4 h-4 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#e07b54', fontSize: '9px', zIndex: 11 }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col w-full lg:w-72 xl:w-80 shrink-0 overflow-y-auto custom-scrollbar" style={{ borderLeft: '1px solid var(--border)' }}>
          <div className="p-4 pb-3">
            <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>Edit Photo</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Frames · Stickers · Share</div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pb-3">
            {(['frames', 'stickers', 'share'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-full text-xs font-semibold transition-all capitalize"
                style={tabStyle(t)}
              >
                {t === 'frames' ? '🖼' : t === 'stickers' ? '😊' : '📤'} {t}
              </button>
            ))}
          </div>

          {/* Frames */}
          {tab === 'frames' && (
            <div className="px-4 pb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Choose a frame style</div>
              <div className="grid grid-cols-2 gap-2">
                {FRAMES.map(frame => (
                  <button key={frame.id} onClick={() => setActiveFrame(frame.id)}
                    className="frame-preview py-3 px-2 text-xs font-medium text-center transition-all"
                    style={activeFrame === frame.id
                      ? { borderColor: 'var(--accent)', background: 'var(--accent-lighter)', color: 'var(--accent)' }
                      : { background: 'var(--bg-primary)', color: 'var(--text-secondary)' }
                    }
                  >
                    {frame.id === 'none' ? '⊘ None' : frame.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stickers */}
          {tab === 'stickers' && (
            <div className="px-4 pb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Tap to add · drag to move</div>
              <div className="sticker-grid">
                {STICKERS.map((emoji, i) => (
                  <button key={i} onClick={() => addSticker(emoji)} className="sticker-btn">{emoji}</button>
                ))}
              </div>
              {stickers.length > 0 && (
                <button onClick={() => setStickers([])}
                  className="mt-3 w-full py-2 rounded-full text-xs font-medium"
                  style={{ background: '#fdeee5', color: '#e07b54', border: '1px solid #f0d8cc' }}
                >🗑 Clear all stickers</button>
              )}
            </div>
          )}

          {/* Share */}
          {tab === 'share' && (
            <div className="px-4 pb-4 space-y-2">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Share your photo</div>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button onClick={() => handleShare('native')}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #e07b54, #c85e38)', boxShadow: '0 3px 10px rgba(224,123,84,0.3)' }}
                >📤 Share via Device</button>
              )}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'twitter', label: '𝕏 Twitter', bg: '#e8f4fd', color: '#1da1f2', border: '#b8d9f5' },
                  { key: 'whatsapp', label: '💬 WhatsApp', bg: '#e8f8ed', color: '#25d366', border: '#a8dfc0' },
                  { key: 'facebook', label: '👍 Facebook', bg: '#eaedfa', color: '#1877f2', border: '#b0c0f0' },
                  { key: 'pinterest', label: '📌 Pinterest', bg: '#fde8e8', color: '#e60023', border: '#f0b0b0' },
                ].map(p => (
                  <button key={p.key} onClick={() => handleShare(p.key)}
                    className="py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}
                  >{p.label}</button>
                ))}
              </div>
              <button onClick={handleCopyLink}
                className="w-full py-2.5 rounded-full text-xs font-semibold border transition-all"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >📋 Copy Image URL</button>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', margin: '0 16px' }} />

          {/* Download */}
          <div className="p-4">
            <button onClick={handleDownload}
              className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #e07b54, #c85e38)', boxShadow: '0 3px 12px rgba(224,123,84,0.35)' }}
            >⬇ Save Edited Photo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
