'use client';

import { useState } from 'react';
import { FilterSettings } from '@/hooks/useCamera';
import { PRESET_CATEGORIES } from '@/lib/presets';
import { gsap } from 'gsap';
import { toast } from 'react-hot-toast';

interface PresetCategoriesProps {
  onPresetSelect: (preset: FilterSettings) => void;
}

export default function PresetCategories({ onPresetSelect }: PresetCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handlePresetClick = (preset: FilterSettings, name: string, categoryName: string) => {
    onPresetSelect(preset);
    toast.success(`${categoryName}: ${name.replace(/-/g, ' ')}`, { duration: 1500 });
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-white/90 flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-[#a855f7] to-[#ec4899] rounded-full"></span>
        <span>Presets ({PRESET_CATEGORIES.reduce((sum, cat) => sum + Object.keys(cat.presets).length, 0)})</span>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap max-h-16 sm:max-h-20 overflow-y-auto pr-2 custom-scrollbar">
        {PRESET_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 capitalize whitespace-nowrap ${
              activeCategory === category.name
                ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-gradient-to-br from-white/8 to-white/4 border border-white/15 text-white/80 hover:bg-white/10 hover:border-white/25 hover:scale-105'
            }`}
          >
            <span className="mr-1 sm:mr-1.5">{category.icon}</span>
            <span className="hidden sm:inline">{category.name}</span>
            <span className="sm:hidden">{category.name.substring(0, 4)}</span>
          </button>
        ))}
      </div>

      {/* Presets Grid - Show all or filtered by category */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap max-h-24 sm:max-h-32 overflow-y-auto pr-2 custom-scrollbar">
        {PRESET_CATEGORIES.map((category) => {
          // Show all if no category selected, or only selected category
          if (activeCategory && activeCategory !== category.name) return null;
          
          return Object.entries(category.presets).map(([key, preset]) => (
            <button
              key={`${category.name}-${key}`}
              onClick={() => handlePresetClick(preset, key, category.name)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm border border-white/15 text-[10px] sm:text-xs hover:bg-gradient-to-br hover:from-white/15 hover:to-white/8 hover:border-white/25 hover:scale-105 active:scale-95 transition-all duration-200 capitalize font-medium shadow-md hover:shadow-lg"
            >
              <span className="hidden sm:inline">{key.replace(/-/g, ' ')}</span>
              <span className="sm:hidden">{key.split('-')[0]}</span>
            </button>
          ));
        })}
      </div>
    </div>
  );
}

