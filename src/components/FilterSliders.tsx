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
    if (key === 'sepia' || key === 'grayscale' || key === 'invert' || key === 'sharpen' || key === 'exposure' || key === 'temperature' || key === 'tint' || key === 'vibrance' || key === 'shadow' || key === 'highlight' || key === 'noise') {
      if (key === 'exposure') return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
      if (key === 'temperature' || key === 'tint') return `${value > 0 ? '+' : ''}${value}`;
      return `${value}%`;
    }
    if (key === 'opacity' || key === 'gamma') return Number(value).toFixed(2);
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
    
    // Toning
    { key: 'shadow' as const, label: 'Shadows', min: -100, max: 100, step: 1, icon: '🌑', category: 'Toning' },
    { key: 'highlight' as const, label: 'Highlights', min: -100, max: 100, step: 1, icon: '💫', category: 'Toning' },
    { key: 'opacity' as const, label: 'Opacity', min: 0, max: 1, step: 0.01, icon: '👻', category: 'Toning' },
    
    // Transform
    { key: 'scale' as const, label: 'Zoom', min: 1, max: 2, step: 0.01, icon: '🔍', category: 'Transform' },
  ];

  const categories = ['Basic', 'Color', 'Effects', 'Toning', 'Transform'];

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="text-xs font-semibold text-white/90 mb-2 flex items-center justify-between">
        <span>Filters & Effects</span>
        <span className="text-white/50 text-[10px]">{sliders.length} filters</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 sm:space-y-4">
        {categories.map((category) => {
          const categorySliders = sliders.filter(s => s.category === category);
          if (categorySliders.length === 0) return null;
          
          return (
            <div key={category} className="space-y-2">
              <div className="text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                {category}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {categorySliders.map(({ key, label, min, max, step, icon }) => (
                  <div
                    key={key}
                    className="bg-gradient-to-b from-white/10 to-white/5 p-2 sm:p-2.5 rounded-lg border border-white/20 hover:border-white/30 transition-all hover:scale-[1.02]"
                  >
                    <label className="flex items-center justify-between text-[10px] sm:text-xs text-white/90 mb-1 sm:mb-1.5">
                      <span className="flex items-center gap-1">
                        <span className="text-xs sm:text-sm">{icon}</span>
                        <span className="font-medium text-[10px] sm:text-[11px]">{label}</span>
                      </span>
                      <span className="text-white/70 font-mono text-[9px] sm:text-[10px]">{formatValue(key, filters[key])}</span>
                    </label>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={filters[key]}
                      onChange={(e) => updateFilter(key, parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
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
