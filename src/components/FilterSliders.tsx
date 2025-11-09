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
    return Number(value).toFixed(2);
  };

  const sliders = [
    { key: 'brightness' as const, label: 'Brightness', min: 0.6, max: 1.6, step: 0.01 },
    { key: 'contrast' as const, label: 'Contrast', min: 0.6, max: 1.6, step: 0.01 },
    { key: 'saturate' as const, label: 'Saturation', min: 0.5, max: 1.8, step: 0.01 },
    { key: 'hue' as const, label: 'Hue rotate', min: 0, max: 360, step: 1 },
    { key: 'blur' as const, label: 'Smooth (blur)', min: 0, max: 4, step: 0.1 },
    { key: 'scale' as const, label: 'Zoom (crop)', min: 1, max: 1.8, step: 0.01 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 pt-1.5">
      {sliders.map(({ key, label, min, max, step }) => (
        <div
          key={key}
          className="bg-gradient-to-b from-white/15 to-transparent p-2.5 rounded-[10px] border border-white/20"
        >
          <label className="block text-xs text-white/80 mb-1.5">
            {label} <span>{formatValue(key, filters[key])}</span>
          </label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={filters[key]}
            onChange={(e) => updateFilter(key, parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
}

