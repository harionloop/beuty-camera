'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FilterSettings, DEFAULT_FILTERS } from '@/hooks/useCamera';
import { updatePhoto, getPhoto } from '@/lib/indexeddb';
import FilterSliders from './FilterSliders';

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
  onUpdated?: () => void;
}

export interface FrameDef {
  id: string;
  label: string;
  category: 'Classic' | 'Pastel' | 'Vintage' | 'Gradients' | 'Creative';
  style: React.CSSProperties;
}

const FRAMES: FrameDef[] = [
  // Classic
  { id: 'none', label: 'None', category: 'Classic', style: {} },
  { id: 'white', label: 'Studio White', category: 'Classic', style: { border: '14px solid #ffffff', boxShadow: '0 0 0 2px #e0d0c0, 0 8px 24px rgba(0,0,0,0.12)' } },
  { id: 'dark', label: 'Noir Ebony', category: 'Classic', style: { border: '14px solid #1a1410', boxShadow: '0 0 0 2px #5c3d2e, 0 8px 24px rgba(0,0,0,0.4)' } },
  { id: 'minimal', label: 'Thin Minimal', category: 'Classic', style: { border: '3px solid #6b4d38', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } },
  { id: 'double-classic', label: 'Dual Accent', category: 'Classic', style: { border: '8px solid #ffffff', outline: '3px solid #d4956a', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } },
  { id: 'museum', label: 'Museum Mat', category: 'Classic', style: { border: '22px solid #faf6f0', outline: '1px solid #dcd3c6', boxShadow: '0 6px 28px rgba(0,0,0,0.15)' } },

  // Pastel
  { id: 'warm', label: 'Warm Linen', category: 'Pastel', style: { border: '14px solid #f5e6d3', boxShadow: '0 0 0 2px #d4956a, 0 8px 24px rgba(0,0,0,0.1)' } },
  { id: 'rose', label: 'Rose Bloom', category: 'Pastel', style: { border: '12px solid #fce4ec', outline: '3px solid #f48fb1', boxShadow: '0 8px 24px rgba(244,143,177,0.25)' } },
  { id: 'sage', label: 'Sage Garden', category: 'Pastel', style: { border: '12px solid #e8f5e9', outline: '3px solid #81c784', boxShadow: '0 8px 24px rgba(129,199,132,0.22)' } },
  { id: 'lavender', label: 'Lavender Dream', category: 'Pastel', style: { border: '12px solid #f3e5f5', outline: '3px solid #ba68c8', boxShadow: '0 8px 24px rgba(186,104,200,0.22)' } },
  { id: 'peach', label: 'Peach Glow', category: 'Pastel', style: { border: '12px solid #fff3e0', outline: '3px solid #ffb74d', boxShadow: '0 8px 24px rgba(255,183,77,0.22)' } },
  { id: 'mint', label: 'Mint Fresh', category: 'Pastel', style: { border: '12px solid #e0f2f1', outline: '3px solid #4db6ac', boxShadow: '0 8px 24px rgba(77,182,172,0.22)' } },
  { id: 'sky', label: 'Soft Sky', category: 'Pastel', style: { border: '12px solid #e1f5fe', outline: '3px solid #4fc3f7', boxShadow: '0 8px 24px rgba(79,195,247,0.22)' } },

  // Vintage
  { id: 'polaroid', label: 'Classic Polaroid', category: 'Vintage', style: { padding: '12px 12px 48px 12px', background: '#ffffff', boxShadow: '0 8px 28px rgba(0,0,0,0.18)' } },
  { id: 'polaroid-dark', label: 'Noir Polaroid', category: 'Vintage', style: { padding: '12px 12px 48px 12px', background: '#201815', boxShadow: '0 8px 28px rgba(0,0,0,0.45)' } },
  { id: 'filmstrip', label: '35mm Filmstrip', category: 'Vintage', style: { borderTop: '20px solid #14100c', borderBottom: '20px solid #14100c', borderLeft: '4px solid #14100c', borderRight: '4px solid #14100c', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' } },
  { id: 'parchment', label: 'Antique Parchment', category: 'Vintage', style: { border: '14px solid #ede1d1', boxShadow: 'inset 0 0 16px rgba(120,70,20,0.22), 0 8px 24px rgba(0,0,0,0.15)' } },
  { id: 'postage', label: 'Postage Stamp', category: 'Vintage', style: { border: '10px dashed #d9b897', padding: '6px', background: '#fefbf6', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' } },

  // Gradients
  { id: 'gold', label: 'Golden Hour', category: 'Gradients', style: { border: '10px solid #f4c060', outline: '3px solid #e07b54', boxShadow: '0 8px 26px rgba(224,123,84,0.35)' } },
  { id: 'sunset', label: 'Sunset Horizon', category: 'Gradients', style: { border: '10px solid #ff758c', outline: '3px solid #ff7eb3', boxShadow: '0 8px 26px rgba(255,117,140,0.35)' } },
  { id: 'aurora', label: 'Neon Aurora', category: 'Gradients', style: { border: '10px solid #00c6ff', outline: '3px solid #0072ff', boxShadow: '0 8px 26px rgba(0,198,255,0.35)' } },
  { id: 'blush', label: 'Sweet Blush', category: 'Gradients', style: { border: '10px solid #fbc2eb', outline: '3px solid #a6c1ee', boxShadow: '0 8px 26px rgba(251,194,235,0.35)' } },
  { id: 'copper', label: 'Metallic Copper', category: 'Gradients', style: { border: '12px solid #c77d58', outline: '2px solid #e8a584', boxShadow: '0 8px 26px rgba(199,125,88,0.35)' } },

  // Creative
  { id: 'dots', label: 'Polka Border', category: 'Creative', style: { border: '8px dotted #e07b54', padding: '6px', background: '#fff9f5', boxShadow: '0 6px 20px rgba(224,123,84,0.2)' } },
  { id: 'cinema', label: 'Cinema Scope', category: 'Creative', style: { borderTop: '24px solid #000000', borderBottom: '24px solid #000000', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' } },
  { id: 'neon', label: 'Cyber Glow', category: 'Creative', style: { border: '5px solid #ff2a85', boxShadow: '0 0 16px #ff2a85, inset 0 0 8px #ff2a85' } },
];

const STICKER_CATEGORIES = [
  {
    id: 'sparkles',
    label: 'Sparkles',
    icon: '✨',
    items: ['✨', '⭐', '🌟', '💫', '⚡', '🌙', '☀️', '🔥', '🪄', '🔮', '💎', '🌈', '🦋', '🕊️'],
  },
  {
    id: 'hearts',
    label: 'Hearts',
    icon: '💖',
    items: ['💖', '💕', '💗', '💓', '💞', '💘', '💝', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍'],
  },
  {
    id: 'nature',
    label: 'Nature',
    icon: '🌸',
    items: ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🍀', '🌿', '🍃', '🌴', '🍁', '🍄', '🌱'],
  },
  {
    id: 'faces',
    label: 'Faces',
    icon: '😊',
    items: ['😊', '😍', '🥰', '😘', '😎', '🤩', '😄', '😋', '😜', '🥳', '😇', '🤗', '🤭', '😻'],
  },
  {
    id: 'party',
    label: 'Party',
    icon: '🎉',
    items: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎗', '👑', '🎂', '🥂', '🍾', '🍰', '🧁', '🍿', '🍭'],
  },
  {
    id: 'food',
    label: 'Food',
    icon: '🍓',
    items: ['🍓', '🍑', '🍒', '🍉', '🍇', '🥑', '🍩', '🍪', '☕', '🧋', '🍦', '🍨', '🍕', '🥞'],
  },
  {
    id: 'cute',
    label: 'Cute',
    icon: '🐱',
    items: ['🐱', '🐶', '🐰', '🐼', '🦊', '🐻', '🐨', '🐣', '🦄', '🐬', '🦩', '🐾', '🧸', '🐥'],
  },
];

const EDITOR_PRESETS: { name: string; icon: string; filters: Partial<FilterSettings> }[] = [
  { name: 'Original', icon: '⊘', filters: DEFAULT_FILTERS },
  { name: 'Warm Sunset', icon: '🌅', filters: { brightness: 1.1, contrast: 1.15, saturate: 1.3, hue: 15, sepia: 12, exposure: 0.2, temperature: 35, vibrance: 25, vignette: 20 } },
  { name: 'Golden Hour', icon: '✨', filters: { brightness: 1.12, contrast: 1.1, saturate: 1.25, hue: 25, sepia: 18, exposure: 0.2, temperature: 40, highlight: 15 } },
  { name: 'Noir B&W', icon: '🎬', filters: { brightness: 1.05, contrast: 1.35, saturate: 0, grayscale: 100, exposure: 0.1, clarity: 25, vignette: 30 } },
  { name: 'Vintage 70s', icon: '🎞️', filters: { brightness: 1.08, contrast: 0.95, saturate: 0.85, sepia: 35, exposure: 0.1, grain: 20, vignette: 25 } },
  { name: 'Cool Breeze', icon: '❄️', filters: { brightness: 1.06, contrast: 1.08, saturate: 1.1, hue: 200, tint: -25, exposure: 0.1 } },
  { name: 'Cyber Neon', icon: '⚡', filters: { brightness: 1.15, contrast: 1.3, saturate: 1.8, hue: 290, clarity: 30, vibrance: 40 } },
  { name: 'Soft Velvet', icon: '🌸', filters: { brightness: 1.12, contrast: 0.92, saturate: 1.15, blur: 0.3, sepia: 8, highlight: 20 } },
  { name: 'Vivid Pop', icon: '🎨', filters: { brightness: 1.1, contrast: 1.2, saturate: 1.5, clarity: 20, vibrance: 35 } },
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

function getEditorFilterString(filters: FilterSettings): string {
  const {
    brightness, contrast, saturate, hue, blur, sepia, grayscale, invert, opacity,
    exposure, vibrance, tint, clarity
  } = filters;

  const effBrightness = Math.max(0.1, brightness + (exposure || 0) * 0.2);
  const effContrast = Math.max(0.1, contrast * (1 + (clarity || 0) / 200));
  const effSaturate = Math.max(0, saturate * (1 + (vibrance || 0) / 100));
  const effHue = ((hue || 0) + (tint || 0) * 0.5) % 360;

  const filtersArray = [
    `brightness(${effBrightness.toFixed(2)})`,
    `contrast(${effContrast.toFixed(2)})`,
    `saturate(${effSaturate.toFixed(2)})`,
    `hue-rotate(${effHue.toFixed(1)}deg)`,
    blur > 0 ? `blur(${blur.toFixed(1)}px)` : '',
    sepia > 0 ? `sepia(${sepia}%)` : '',
    grayscale > 0 ? `grayscale(${grayscale}%)` : '',
    invert > 0 ? `invert(${invert}%)` : '',
    opacity < 1 ? `opacity(${opacity})` : '',
  ];

  return filtersArray.filter(Boolean).join(' ');
}

export default function ImageEditor({ imageUrl, imageId, onClose, onUpdated }: ImageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFrame, setActiveFrame] = useState('none');
  const [frameCategory, setFrameCategory] = useState<string>('All');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [stickerCategory, setStickerCategory] = useState<string>('sparkles');
  const [stickerSize, setStickerSize] = useState<number>(42);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tab, setTab] = useState<'adjust' | 'frames' | 'stickers' | 'share'>('adjust');
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [isSaving, setIsSaving] = useState(false);

  const activeSticker = stickers.find(s => s.id === selectedStickerId);
  const frameStyle = FRAMES.find(f => f.id === activeFrame)?.style || {};
  const currentStickersList = STICKER_CATEGORIES.find(c => c.id === stickerCategory)?.items || STICKER_CATEGORIES[0].items;

  const filteredFrames = frameCategory === 'All'
    ? FRAMES
    : FRAMES.filter(f => f.category === frameCategory);

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: `s-${Date.now()}-${Math.random()}`,
      emoji,
      x: 30 + (Math.random() * 30),
      y: 30 + (Math.random() * 30),
      size: stickerSize,
    };
    setStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    toast.success(`${emoji} added! Drag to move.`, {
      duration: 1500,
      style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px', fontSize: '13px' }
    });
  };

  const removeSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const duplicateSticker = (id: string) => {
    const target = stickers.find(s => s.id === id);
    if (!target) return;
    const duplicated: Sticker = {
      ...target,
      id: `s-${Date.now()}-${Math.random()}`,
      x: Math.min(85, target.x + 5),
      y: Math.min(85, target.y + 5),
    };
    setStickers(prev => [...prev, duplicated]);
    setSelectedStickerId(duplicated.id);
  };

  const changeStickerSize = (newSize: number) => {
    const clamped = Math.max(16, Math.min(110, newSize));
    setStickerSize(clamped);
    if (selectedStickerId) {
      setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, size: clamped } : s));
    }
  };

  const onStickerMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStickerId(id);
    const target = stickers.find(s => s.id === id);
    if (target) setStickerSize(target.size);
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
        ? { ...s, x: Math.max(0, Math.min(92, s.x + dx)), y: Math.max(0, Math.min(92, s.y + dy)) }
        : s
      ));
      setDragOffset({ x: e.clientX, y: e.clientY });
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, dragOffset]);

  const captureEditedBlob = async (): Promise<Blob> => {
    let sourceUrl = imageUrl;
    let localBlobToRevoke: string | null = null;
    try {
      const storedItem = await getPhoto(imageId);
      if (storedItem?.blob) {
        localBlobToRevoke = URL.createObjectURL(storedItem.blob);
        sourceUrl = localBlobToRevoke;
      }
    } catch {
      // fallback to imageUrl
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image element'));
        img.src = sourceUrl;
      });

      const baseW = img.naturalWidth || img.width || 800;
      const baseH = img.naturalHeight || img.height || 600;

      // Determine frame padding and colors
      let padTop = 0;
      let padBottom = 0;
      let padLeft = 0;
      let padRight = 0;
      let frameColor = '#ffffff';
      let frameOutline: string | null = null;
      let isFilmstrip = false;

      if (activeFrame !== 'none') {
        const minDim = Math.min(baseW, baseH);
        const borderThickness = Math.max(14, Math.round(minDim * 0.04));

        if (activeFrame === 'polaroid' || activeFrame === 'polaroid-dark') {
          padTop = borderThickness;
          padLeft = borderThickness;
          padRight = borderThickness;
          padBottom = Math.round(borderThickness * 3.6);
          frameColor = activeFrame === 'polaroid-dark' ? '#1c1510' : '#ffffff';
        } else if (activeFrame === 'filmstrip') {
          isFilmstrip = true;
          padTop = Math.round(borderThickness * 1.4);
          padBottom = Math.round(borderThickness * 1.4);
          padLeft = Math.round(borderThickness * 0.25);
          padRight = Math.round(borderThickness * 0.25);
          frameColor = '#14100c';
        } else if (activeFrame === 'cinema') {
          padTop = Math.round(borderThickness * 1.8);
          padBottom = Math.round(borderThickness * 1.8);
          frameColor = '#000000';
        } else {
          padTop = padBottom = padLeft = padRight = borderThickness;
          if (activeFrame === 'white') frameColor = '#ffffff';
          else if (activeFrame === 'dark') frameColor = '#1a1410';
          else if (activeFrame === 'minimal') { frameColor = '#6b4d38'; padTop = padBottom = padLeft = padRight = Math.max(4, Math.round(borderThickness * 0.25)); }
          else if (activeFrame === 'warm') { frameColor = '#f5e6d3'; frameOutline = '#d4956a'; }
          else if (activeFrame === 'rose') { frameColor = '#fce4ec'; frameOutline = '#f48fb1'; }
          else if (activeFrame === 'sage') { frameColor = '#e8f5e9'; frameOutline = '#81c784'; }
          else if (activeFrame === 'lavender') { frameColor = '#f3e5f5'; frameOutline = '#ba68c8'; }
          else if (activeFrame === 'peach') { frameColor = '#fff3e0'; frameOutline = '#ffb74d'; }
          else if (activeFrame === 'mint') { frameColor = '#e0f2f1'; frameOutline = '#4db6ac'; }
          else if (activeFrame === 'sky') { frameColor = '#e1f5fe'; frameOutline = '#4fc3f7'; }
          else if (activeFrame === 'gold') { frameColor = '#f4c060'; frameOutline = '#e07b54'; }
          else if (activeFrame === 'sunset') { frameColor = '#ff758c'; frameOutline = '#ff7eb3'; }
          else if (activeFrame === 'aurora') { frameColor = '#00c6ff'; frameOutline = '#0072ff'; }
          else if (activeFrame === 'blush') { frameColor = '#fbc2eb'; frameOutline = '#a6c1ee'; }
          else if (activeFrame === 'copper') { frameColor = '#c77d58'; frameOutline = '#e8a584'; }
          else if (activeFrame === 'neon') { frameColor = '#ff2a85'; }
          else if (activeFrame === 'museum') { padTop = padBottom = padLeft = padRight = Math.round(borderThickness * 1.5); frameColor = '#faf6f0'; frameOutline = '#dcd3c6'; }
          else if (activeFrame === 'double-classic') { frameColor = '#ffffff'; frameOutline = '#d4956a'; }
          else if (activeFrame === 'postage') { frameColor = '#d9b897'; }
          else if (activeFrame === 'dots') { frameColor = '#e07b54'; }
          else if (activeFrame === 'parchment') { frameColor = '#ede1d1'; }
        }
      }

      const canvasW = baseW + padLeft + padRight;
      const canvasH = baseH + padTop + padBottom;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D canvas context');

      // Draw frame background
      if (activeFrame !== 'none') {
        ctx.fillStyle = frameColor;
        ctx.fillRect(0, 0, canvasW, canvasH);

        if (frameOutline) {
          ctx.lineWidth = Math.max(3, Math.round(canvasW * 0.006));
          ctx.strokeStyle = frameOutline;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvasW - ctx.lineWidth, canvasH - ctx.lineWidth);
        }

        if (isFilmstrip) {
          ctx.fillStyle = '#ffffff';
          const holeW = Math.max(6, Math.round(canvasW * 0.018));
          const holeH = Math.max(8, Math.round(padTop * 0.45));
          const holeGap = Math.max(10, Math.round(canvasW * 0.04));
          for (let x = holeGap; x < canvasW - holeW; x += holeGap + holeW) {
            ctx.fillRect(x, (padTop - holeH) / 2, holeW, holeH);
            ctx.fillRect(x, canvasH - padBottom + (padBottom - holeH) / 2, holeW, holeH);
          }
        }
      }

      // Draw photo with CSS filters & scale
      ctx.save();
      ctx.beginPath();
      ctx.rect(padLeft, padTop, baseW, baseH);
      ctx.clip();

      const filterStr = getEditorFilterString(filters);
      if (filterStr) {
        ctx.filter = filterStr;
      }

      const scale = filters.scale || 1;
      if (scale !== 1) {
        ctx.translate(padLeft + baseW / 2, padTop + baseH / 2);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
      } else {
        ctx.drawImage(img, padLeft, padTop, baseW, baseH);
      }
      ctx.restore();

      // Draw Vignette
      if (filters.vignette > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, padTop, baseW, baseH);
        ctx.clip();

        const cx = padLeft + baseW / 2;
        const cy = padTop + baseH / 2;
        const r = Math.max(baseW, baseH) / 2;
        const innerR = Math.max(0, r * (1 - filters.vignette / 100));

        const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, r);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.95, (filters.vignette / 100) * 0.9)})`);

        ctx.fillStyle = grad;
        ctx.fillRect(padLeft, padTop, baseW, baseH);
        ctx.restore();
      }

      // Draw Stickers
      if (stickers.length > 0) {
        const previewImg = containerRef.current?.querySelector('img');
        const previewW = previewImg?.clientWidth || 500;
        const scaleRatio = previewW > 0 ? (baseW / previewW) : 1;

        ctx.save();
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        for (const s of stickers) {
          const fontSize = Math.max(16, Math.round(s.size * scaleRatio));
          ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          const posX = padLeft + (s.x / 100) * baseW;
          const posY = padTop + (s.y / 100) * baseH;
          ctx.fillText(s.emoji, posX, posY);
        }
        ctx.restore();
      }

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate PNG blob'));
        }, 'image/png');
      });
    } finally {
      if (localBlobToRevoke) {
        URL.revokeObjectURL(localBlobToRevoke);
      }
    }
  };

  // Requirement 4: Update the existing photo in gallery
  const handleUpdateInGallery = async () => {
    try {
      setIsSaving(true);
      const blob = await captureEditedBlob();
      await updatePhoto(imageId, {
        blob,
        meta: {
          filters: {
            brightness: filters.brightness.toString(),
            contrast: filters.contrast.toString(),
            saturate: filters.saturate.toString(),
            hue: filters.hue.toString(),
            blur: filters.blur.toString(),
            scale: filters.scale.toString(),
          }
        }
      });
      window.dispatchEvent(new Event('photoAdded'));
      onUpdated?.();
      toast.success('Photo updated in gallery! ✨', {
        style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px' }
      });
      onClose();
    } catch (err) {
      console.error('Failed to update photo', err);
      toast.error('Failed to update photo in gallery');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = useCallback(async () => {
    try {
      setIsSaving(true);
      const blob = await captureEditedBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beautycam_edited_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Downloaded as PNG! 🖼️', {
        style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px' }
      });
    } catch (err) {
      console.error('Failed to download', err);
      toast.error('Failed to export edited photo');
    } finally {
      setIsSaving(false);
    }
  }, [imageId, imageUrl, filters, activeFrame, stickers]);

  const handleShare = async (platform: string) => {
    if (platform === 'native' && typeof navigator.share !== 'undefined') {
      try {
        const blob = await captureEditedBlob();
        const file = new File([blob], 'beautycam_edited.png', { type: 'image/png' });
        await navigator.share({ title: 'BeautyCam Photo', text: 'Check out my edited photo! ✨', files: [file] });
        return;
      } catch { /* fallback */ }
    }
    const link = getShareLink(platform, imageUrl);
    if (link) window.open(link, '_blank', 'width=600,height=450');
    toast.success('Opening share...', { icon: '🔗', style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px', fontSize: '13px' } });
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(imageUrl).then(() => {
        toast.success('URL copied!', { icon: '📋', style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px', fontSize: '13px' } });
      });
    }
  };

  const applyPreset = (presetFilters: Partial<FilterSettings>) => {
    setFilters(prev => ({ ...prev, ...presetFilters }));
    toast.success('Preset applied', { duration: 1000, style: { fontSize: '12px', borderRadius: '10px' } });
  };

  const tabStyle = (t: string) => tab === t
    ? { background: 'var(--accent)', color: 'white', boxShadow: '0 2px 8px rgba(224,123,84,0.3)' }
    : { background: 'var(--accent-lighter)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };

  const computedFilterString = getEditorFilterString(filters);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(40,25,15,0.65)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isSaving) onClose(); }}
    >
      <div
        className="relative flex flex-col lg:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl fade-in-up"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          height: '92vh',
          maxHeight: '850px',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110 disabled:opacity-50"
          style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}
          title="Close Editor"
        >
          ✕
        </button>

        {/* Image Preview Canvas Area */}
        <div
          className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden relative"
          style={{ background: 'var(--bg-secondary)', minHeight: '280px' }}
          onClick={() => setSelectedStickerId(null)}
        >
          <div
            ref={containerRef}
            className="relative select-none transition-all duration-200"
            style={{
              ...frameStyle,
              borderRadius: (activeFrame === 'none' || activeFrame.startsWith('polaroid')) ? '12px' : '4px',
              display: 'inline-block',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* The Image with CSS filters & transform */}
            <div className="relative overflow-hidden" style={{ borderRadius: activeFrame === 'none' ? '8px' : '0' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Edit Preview"
                crossOrigin="anonymous"
                draggable={false}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '56vh',
                  objectFit: 'contain',
                  filter: computedFilterString,
                  transform: `scale(${filters.scale})`,
                  transformOrigin: 'center center',
                  transition: 'filter 0.08s ease',
                }}
              />

              {/* Vignette Overlay */}
              {filters.vignette > 0 && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(circle, transparent ${Math.max(10, 100 - filters.vignette)}%, rgba(0,0,0,${(filters.vignette / 100) * 0.9}) 100%)`,
                  }}
                />
              )}
            </div>

            {/* Draggable & Resizable Stickers */}
            {stickers.map(s => {
              const isSelected = selectedStickerId === s.id;
              return (
                <div
                  key={s.id}
                  onMouseDown={e => onStickerMouseDown(e, s.id)}
                  onClick={e => { e.stopPropagation(); setSelectedStickerId(s.id); setStickerSize(s.size); }}
                  className={`absolute select-none cursor-move transition-transform ${isSelected ? 'z-30 scale-105' : 'z-20'}`}
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    fontSize: `${s.size}px`,
                    lineHeight: 1,
                    filter: isSelected ? 'drop-shadow(0 0 6px rgba(224,123,84,0.7))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                  }}
                >
                  <div className="relative group">
                    <span>{s.emoji}</span>

                    {/* Selection Box & Floating Mini Toolbar */}
                    {isSelected && (
                      <div
                        className="absolute -inset-1.5 rounded-lg border-2 border-dashed pointer-events-none"
                        style={{ borderColor: 'var(--accent)' }}
                      />
                    )}

                    {isSelected && (
                      <div
                        className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full shadow-lg z-40 whitespace-nowrap"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => changeStickerSize(s.size - 6)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold hover:bg-orange-100"
                          style={{ color: 'var(--text-primary)' }}
                          title="Decrease size"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-mono px-1" style={{ color: 'var(--text-muted)' }}>
                          {s.size}px
                        </span>
                        <button
                          onClick={() => changeStickerSize(s.size + 6)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold hover:bg-orange-100"
                          style={{ color: 'var(--text-primary)' }}
                          title="Increase size"
                        >
                          +
                        </button>
                        <button
                          onClick={() => duplicateSticker(s.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-orange-100"
                          title="Duplicate sticker"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeSticker(s.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white hover:scale-105"
                          style={{ background: '#e07b54' }}
                          title="Delete sticker"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Controls & Tabs */}
        <div
          className="flex flex-col w-full lg:w-80 xl:w-96 shrink-0 h-full overflow-hidden"
          style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div className="p-4 pb-2 shrink-0">
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Edit Photo
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Adjustments · Frames · Stickers · Share
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 px-4 pb-3 shrink-0">
            {([
              { key: 'adjust', icon: '✨', label: 'Adjust' },
              { key: 'frames', icon: '🖼', label: 'Frames' },
              { key: 'stickers', icon: '😊', label: 'Stickers' },
              { key: 'share', icon: '📤', label: 'Share' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1"
                style={tabStyle(t.key)}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 pb-3">

            {/* TAB 1: ADJUSTMENTS & EFFECTS (Requirement 1) */}
            {tab === 'adjust' && (
              <div className="space-y-4 pt-1">
                {/* Quick Presets */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                    <span>⚡ Quick Presets</span>
                    <button
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="text-[11px] font-medium hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Reset All
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {EDITOR_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => applyPreset(p.filters)}
                        className="py-1.5 px-2 rounded-xl text-xs font-medium text-center border transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                        style={{
                          background: 'var(--bg-secondary)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span>{p.icon}</span>
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)' }} />

                {/* Adjustments & Effects Sliders (Identical to Camera) */}
                <FilterSliders filters={filters} onFilterChange={setFilters} />
              </div>
            )}

            {/* TAB 2: FRAMES WITH CATEGORIES (Requirement 6) */}
            {tab === 'frames' && (
              <div className="space-y-3 pt-1">
                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['All', 'Classic', 'Pastel', 'Vintage', 'Gradients', 'Creative'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFrameCategory(cat)}
                      className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                      style={frameCategory === cat
                        ? { background: 'var(--accent)', color: 'white' }
                        : { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Frames Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {filteredFrames.map(frame => (
                    <button
                      key={frame.id}
                      onClick={() => setActiveFrame(frame.id)}
                      className="frame-preview py-3 px-2 text-xs font-medium text-center transition-all rounded-xl"
                      style={activeFrame === frame.id
                        ? { borderColor: 'var(--accent)', background: 'var(--accent-lighter)', color: 'var(--accent)' }
                        : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
                      }
                    >
                      <div className="text-base mb-1">
                        {frame.id === 'none' ? '⊘' : frame.category === 'Vintage' ? '🎞️' : frame.category === 'Gradients' ? '✨' : '🖼️'}
                      </div>
                      <div className="truncate">{frame.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: STICKERS WITH CATEGORIES & SIZE SLIDER (Requirement 5) */}
            {tab === 'stickers' && (
              <div className="space-y-3.5 pt-1">
                {/* Sticker Size Controls */}
                <div
                  className="p-3 rounded-2xl border space-y-2"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <span>
                      {selectedStickerId ? `Selected Sticker: ${activeSticker?.emoji || ''}` : 'Sticker Size'}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-lighter)', color: 'var(--accent)' }}>
                      {stickerSize}px
                    </span>
                  </div>

                  <input
                    type="range"
                    min={18}
                    max={100}
                    step={2}
                    value={stickerSize}
                    onChange={(e) => changeStickerSize(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--accent)' }}
                  />

                  {/* Quick Size Presets */}
                  <div className="flex gap-1.5 pt-1">
                    {[
                      { label: 'S', size: 28 },
                      { label: 'M', size: 42 },
                      { label: 'L', size: 60 },
                      { label: 'XL', size: 84 },
                    ].map(s => (
                      <button
                        key={s.label}
                        onClick={() => changeStickerSize(s.size)}
                        className="flex-1 py-1 rounded-lg text-xs font-medium transition-all"
                        style={stickerSize === s.size
                          ? { background: 'var(--accent)', color: 'white' }
                          : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {selectedStickerId && (
                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => duplicateSticker(selectedStickerId)}
                        className="flex-1 py-1 rounded-lg text-xs font-medium border transition-all"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      >
                        📋 Duplicate
                      </button>
                      <button
                        onClick={() => removeSticker(selectedStickerId)}
                        className="flex-1 py-1 rounded-lg text-xs font-medium text-white transition-all"
                        style={{ background: '#e07b54' }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Sticker Category Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {STICKER_CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setStickerCategory(c.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all"
                      style={stickerCategory === c.id
                        ? { background: 'var(--accent)', color: 'white' }
                        : { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                      }
                    >
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Stickers Grid */}
                <div className="sticker-grid">
                  {currentStickersList.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className="sticker-btn text-2xl transition-transform hover:scale-125 active:scale-95"
                      title="Tap to add"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {stickers.length > 0 && (
                  <button
                    onClick={() => { setStickers([]); setSelectedStickerId(null); }}
                    className="w-full py-2 rounded-full text-xs font-medium transition-all"
                    style={{ background: 'var(--accent-lighter)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                  >
                    🗑 Clear all {stickers.length} stickers
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: SHARE */}
            {tab === 'share' && (
              <div className="space-y-3 pt-1">
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Share your edited photo
                </div>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={() => handleShare('native')}
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #e07b54, #c85e38)', boxShadow: '0 3px 10px rgba(224,123,84,0.3)' }}
                  >
                    📤 Share via Device
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'twitter', label: '𝕏 Twitter', bg: '#e8f4fd', color: '#1da1f2', border: '#b8d9f5' },
                    { key: 'whatsapp', label: '💬 WhatsApp', bg: '#e8f8ed', color: '#25d366', border: '#a8dfc0' },
                    { key: 'facebook', label: '👍 Facebook', bg: '#eaedfa', color: '#1877f2', border: '#b0c0f0' },
                    { key: 'pinterest', label: '📌 Pinterest', bg: '#fde8e8', color: '#e60023', border: '#f0b0b0' },
                  ].map(p => (
                    <button
                      key={p.key}
                      onClick={() => handleShare(p.key)}
                      disabled={isSaving}
                      className="py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-full text-xs font-semibold border transition-all"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                >
                  📋 Copy Image URL
                </button>
              </div>
            )}
          </div>

          {/* Action Footer: Update in Gallery & Download Buttons */}
          <div
            className="p-3.5 shrink-0 flex flex-col gap-2"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}
          >
            {/* Requirement 4: Update the existing photo in gallery */}
            <button
              onClick={handleUpdateInGallery}
              disabled={isSaving}
              className="w-full py-2.5 rounded-full text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
              style={{
                background: 'linear-gradient(135deg, #e07b54, #c85e38)',
                boxShadow: '0 4px 14px rgba(224,123,84,0.35)',
              }}
            >
              <span>💾</span>
              <span>{isSaving ? 'Saving Changes...' : 'Update in Gallery'}</span>
            </button>

            {/* Download as new photo */}
            <button
              onClick={handleDownload}
              disabled={isSaving}
              className="w-full py-2 rounded-full text-xs font-semibold transition-all border hover:bg-orange-50 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>⬇</span>
              <span>Download to Device</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
