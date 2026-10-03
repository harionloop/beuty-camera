'use client';

import { useState, useEffect } from 'react';
import { FilterSettings } from '@/hooks/useCamera';
import { PRESET_CATEGORIES } from '@/lib/presets';
import { toast } from 'react-hot-toast';

interface PresetCategoriesProps {
  onPresetSelect: (preset: Partial<FilterSettings>, presetName: string) => void;
  activePreset: string | null;
}

// Map preset keys to CSS filter strings for visual preview
function getFilterPreview(preset: Partial<FilterSettings>): string {
  const parts: string[] = [];
  if (preset.brightness !== undefined) parts.push(`brightness(${preset.brightness})`);
  if (preset.contrast !== undefined) parts.push(`contrast(${preset.contrast})`);
  if (preset.saturate !== undefined) parts.push(`saturate(${preset.saturate})`);
  if (preset.hue !== undefined) parts.push(`hue-rotate(${preset.hue}deg)`);
  if (preset.blur !== undefined && preset.blur > 0) parts.push(`blur(${Math.min(preset.blur, 2)}px)`);
  if (preset.sepia !== undefined && preset.sepia > 0) parts.push(`sepia(${preset.sepia / 100})`);
  if (preset.grayscale !== undefined && preset.grayscale > 0) parts.push(`grayscale(${preset.grayscale / 100})`);
  if (preset.invert !== undefined && preset.invert > 0) parts.push(`invert(${preset.invert / 100})`);
  return parts.join(' ') || 'none';
}

// Gradient swatch for each preset (used as filter button background)
const SWATCH_GRADIENTS = [
  'linear-gradient(135deg, #ffd6a5, #ffb347)',
  'linear-gradient(135deg, #a8edea, #fed6e3)',
  'linear-gradient(135deg, #d4fc79, #96e6a1)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  'linear-gradient(135deg, #ff9a9e, #fecfef)',
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f6d365, #fda085)',
];

export default function PresetCategories({ onPresetSelect, activePreset }: PresetCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (PRESET_CATEGORIES.length > 0) {
      setActiveCategory(PRESET_CATEGORIES[0].name);
    }
  }, []);

  const handlePresetClick = (preset: Partial<FilterSettings>, name: string, categoryName: string) => {
    onPresetSelect(preset, name);
    toast.success(`${name.replace(/-/g, ' ')}`, {
      duration: 1800,
      icon: '✨',
      style: {
        background: '#fff',
        color: '#3d2b1a',
        border: '1px solid #f0e6dc',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(200,120,80,0.15)',
        fontSize: '13px',
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <span className="w-1 h-3.5 rounded-full" style={{ background: 'var(--accent)' }}></span>
        <span>Presets ({PRESET_CATEGORIES.reduce((sum, cat) => sum + Object.keys(cat.presets).length, 0)})</span>
      </div>

      {/* Category Pills (round) */}
      <div className="flex gap-2 flex-wrap">
        {PRESET_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
            className={`category-pill ${activeCategory === category.name ? 'active' : ''}`}
          >
            <span className="mr-1">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Presets as round filter buttons with visual filter preview */}
      <div className="flex flex-wrap gap-3 pt-1">
        {PRESET_CATEGORIES.map((category, ci) => {
          if (activeCategory && activeCategory !== category.name) return null;

          return Object.entries(category.presets).map(([key, preset], pi) => {
            const swatchBg = SWATCH_GRADIENTS[(ci * 4 + pi) % SWATCH_GRADIENTS.length];
            const cssFilter = getFilterPreview(preset);
            const isActive = activePreset === key;

            return (
              <div key={`${category.name}-${key}`} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => handlePresetClick(preset, key, category.name)}
                  className={`filter-btn-round ${isActive ? 'active' : ''}`}
                  title={key.replace(/-/g, ' ')}
                  style={{
                    background: swatchBg,
                    filter: cssFilter,
                  }}
                />
                <span
                  className="text-center capitalize leading-tight"
                  style={{
                    fontSize: '9px',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                    maxWidth: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {key.replace(/-/g, ' ')}
                </span>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
