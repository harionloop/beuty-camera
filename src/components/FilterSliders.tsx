'use client';

import { FilterSettings } from '@/hooks/useCamera';

interface FilterSlidersProps {
  filters: FilterSettings;
  onFilterChange: (filters: FilterSettings) => void;
}

export default function FilterSliders({ filters, onFilterChange }: FilterSlidersProps) {
  const updateFilter = (key: keyof FilterSettings, value: number) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const formatValue = (key: keyof FilterSettings, value: number): string => {
    if (key === 'hue') return `${value}°`;
    if (key === 'blur') return `${value}px`;
    if (key === 'scale') return `${value}x`;
    if (key === 'sepia' || key === 'grayscale' || key === 'invert' || key === 'sharpen') return `${value}%`;
    if (key === 'opacity') return Number(value).toFixed(2);
    return Number(value).toFixed(2);
  };

  const sliders = [
    { key: 'brightness' as const, label: 'Brightness', min: 0.5, max: 2, step: 0.01, icon: '☀️' },
    { key: 'contrast' as const, label: 'Contrast', min: 0.5, max: 2, step: 0.01, icon: '⚡' },
    { key: 'saturate' as const, label: 'Saturation', min: 0, max: 2, step: 0.01, icon: '🎨' },
    { key: 'hue' as const, label: 'Hue', min: 0, max: 360, step: 1, icon: '🌈' },
    { key: 'blur' as const, label: 'Blur', min: 0, max: 5, step: 0.1, icon: '🌫️' },
    { key: 'sepia' as const, label: 'Sepia', min: 0, max: 100, step: 1, icon: '📸' },
    { key: 'grayscale' as const, label: 'Grayscale', min: 0, max: 100, step: 1, icon: '⚫' },
    { key: 'invert' as const, label: 'Invert', min: 0, max: 100, step: 1, icon: '🔄' },
    { key: 'opacity' as const, label: 'Opacity', min: 0, max: 1, step: 0.01, icon: '👻' },
    { key: 'scale' as const, label: 'Zoom', min: 1, max: 2, step: 0.01, icon: '🔍' },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-white/80 mb-2">Filters & Effects</div>
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {sliders.map(({ key, label, min, max, step, icon }) => (
          <div
            key={key}
            className="bg-gradient-to-b from-white/10 to-white/5 p-3 rounded-lg border border-white/20 hover:border-white/30 transition-colors"
          >
            <label className="flex items-center justify-between text-xs text-white/90 mb-2">
              <span className="flex items-center gap-1.5">
                <span>{icon}</span>
                <span className="font-medium">{label}</span>
              </span>
              <span className="text-white/70 font-mono">{formatValue(key, filters[key])}</span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={filters[key]}
              onChange={(e) => updateFilter(key, parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
