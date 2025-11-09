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
    if (key === 'blur') return `${value.toFixed(1)}px`;
    if (key === 'scale') return `${value.toFixed(2)}x`;
    if (['sepia', 'grayscale', 'invert', 'sharpen', 'noise', 'vignette', 'clarity', 'grain'].includes(key)) {
      return `${Math.round(value)}%`;
    }
    if (['exposure', 'temperature', 'tint', 'vibrance', 'shadow', 'highlight'].includes(key)) {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
    }
    return Number(value).toFixed(2);
  };

  const sliders = [
    // Basic Adjustments
    { key: 'brightness' as const, label: 'Brightness', min: 0.5, max: 2, step: 0.01, icon: '☀️', category: 'Basic' },
    { key: 'contrast' as const, label: 'Contrast', min: 0.5, max: 2, step: 0.01, icon: '⚡', category: 'Basic' },
    { key: 'exposure' as const, label: 'Exposure', min: -2, max: 2, step: 0.1, icon: '📷', category: 'Basic' },
    { key: 'saturate' as const, label: 'Saturation', min: 0, max: 2, step: 0.01, icon: '🎨', category: 'Basic' },
    { key: 'vibrance' as const, label: 'Vibrance', min: -100, max: 100, step: 1, icon: '✨', category: 'Basic' },
    
    // Color Adjustments
    { key: 'hue' as const, label: 'Hue', min: 0, max: 360, step: 1, icon: '🌈', category: 'Color' },
    { key: 'temperature' as const, label: 'Temperature', min: -100, max: 100, step: 1, icon: '🌡️', category: 'Color' },
    { key: 'tint' as const, label: 'Tint', min: -100, max: 100, step: 1, icon: '🎭', category: 'Color' },
    { key: 'gamma' as const, label: 'Gamma', min: 0.5, max: 2, step: 0.01, icon: '💡', category: 'Color' },
    
    // Effects
    { key: 'blur' as const, label: 'Blur', min: 0, max: 5, step: 0.1, icon: '🌫️', category: 'Effects' },
    { key: 'sharpen' as const, label: 'Sharpen', min: 0, max: 100, step: 1, icon: '🔪', category: 'Effects' },
    { key: 'noise' as const, label: 'Noise', min: 0, max: 100, step: 1, icon: '📳', category: 'Effects' },
    { key: 'sepia' as const, label: 'Sepia', min: 0, max: 100, step: 1, icon: '📸', category: 'Effects' },
    { key: 'grayscale' as const, label: 'Grayscale', min: 0, max: 100, step: 1, icon: '⚫', category: 'Effects' },
    { key: 'invert' as const, label: 'Invert', min: 0, max: 100, step: 1, icon: '🔄', category: 'Effects' },
    { key: 'vignette' as const, label: 'Vignette', min: 0, max: 100, step: 1, icon: '🖼️', category: 'Effects' },
    { key: 'clarity' as const, label: 'Clarity', min: 0, max: 100, step: 1, icon: '쨍', category: 'Effects' },
    { key: 'grain' as const, label: 'Grain', min: 0, max: 100, step: 1, icon: '🎞️', category: 'Effects' },
    
    // Toning
    { key: 'shadow' as const, label: 'Shadows', min: -100, max: 100, step: 1, icon: '🌑', category: 'Toning' },
    { key: 'highlight' as const, label: 'Highlights', min: -100, max: 100, step: 1, icon: '💫', category: 'Toning' },
    { key: 'opacity' as const, label: 'Opacity', min: 0, max: 1, step: 0.01, icon: '👻', category: 'Toning' },
    
    // Transform
    { key: 'scale' as const, label: 'Zoom', min: 1, max: 2, step: 0.01, icon: '🔍', category: 'Transform' },
  ];

  const categories = ['Basic', 'Color', 'Effects', 'Toning', 'Transform'];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-sm font-semibold text-white/90 flex items-center justify-between">
        <span>Adjustments & Effects</span>
        <span className="text-white/50 text-xs">{sliders.length} controls</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {categories.map((category) => {
          const categorySliders = sliders.filter(s => s.category === category);
          if (categorySliders.length === 0) return null;
          
          return (
            <div key={category} className="space-y-3">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                {category}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categorySliders.map(({ key, label, min, max, step, icon }) => (
                  <div
                    key={key}
                    className="bg-black/20 p-3 rounded-lg border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:bg-black/30"
                  >
                    <label className="flex items-center justify-between text-xs text-white/80 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm">{icon}</span>
                        <span className="font-semibold">{label}</span>
                      </span>
                      <span className="text-white/60 font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
                        {formatValue(key, filters[key])}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={filters[key]}
                      onChange={(e) => updateFilter(key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #8a2be2 0%, #ff69b4 ${((filters[key] - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((filters[key] - min) / (max - min)) * 100}%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}