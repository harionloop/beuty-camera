'use client';

import { useState, useEffect } from 'react';
import { FilterSettings } from '@/hooks/useCamera';
import { PRESET_CATEGORIES } from '@/lib/presets';
import { toast } from 'react-hot-toast';

interface PresetCategoriesProps {
  onPresetSelect: (preset: FilterSettings, presetName: string) => void;
  activePreset: string | null;
}

export default function PresetCategories({ onPresetSelect, activePreset }: PresetCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (PRESET_CATEGORIES.length > 0) {
      setActiveCategory(PRESET_CATEGORIES[0].name);
    }
  }, []);

  const handlePresetClick = (preset: FilterSettings, name: string, categoryName: string) => {
    onPresetSelect(preset, name);
    toast.success(`${categoryName}: ${name.replace(/-/g, ' ')}`, { 
      duration: 2000,
      icon: '🎨',
      style: {
        background: 'rgba(20, 20, 30, 0.8)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-white/90 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></span>
        <span>Presets ({PRESET_CATEGORIES.reduce((sum, cat) => sum + Object.keys(cat.presets).length, 0)})</span>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {PRESET_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
            className={`btn-glow px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 capitalize whitespace-nowrap ${
              activeCategory === category.name
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 scale-110'
                : 'bg-black/20 border border-white/10 text-white/70 hover:bg-black/30 hover:border-white/20 hover:text-white'
            }`}
          >
            <span className="mr-1.5">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {PRESET_CATEGORIES.map((category) => {
          if (activeCategory && activeCategory !== category.name) return null;
          
          return Object.entries(category.presets).map(([key, preset]) => (
            <button
              key={`${category.name}-${key}`}
              onClick={() => handlePresetClick(preset, key, category.name)}
              className={`px-3 py-2 rounded-lg backdrop-blur-sm border text-xs transition-all duration-200 capitalize font-medium shadow-md hover:shadow-lg ${
                activePreset === key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
                  : 'bg-black/20 border-white/10 hover:bg-black/30 hover:border-purple-400/50'
              }`}
            >
              {key.replace(/-/g, ' ')}
            </button>
          ));
        })}
      </div>
    </div>
  );
}
