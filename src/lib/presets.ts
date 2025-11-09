import { FilterSettings } from '@/hooks/useCamera';

export interface PresetCategory {
  name: string;
  icon: string;
  presets: Record<string, FilterSettings>;
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    name: 'Warm',
    icon: '🔥',
    presets: {
      'warm-sunset': {
        brightness: 1.08, contrast: 1.12, saturate: 1.3, hue: 20, blur: 0.2, scale: 1,
        sepia: 10, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.25, temperature: 35, tint: 20, vibrance: 25, shadow: 5, highlight: 20, gamma: 1.1, noise: 0
      },
      'warm-golden': {
        brightness: 1.06, contrast: 1.08, saturate: 1.15, hue: 30, blur: 0, scale: 1,
        sepia: 15, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.18, temperature: 40, tint: 15, vibrance: 20, shadow: 10, highlight: 15, gamma: 1.08, noise: 0
      },
      'warm-amber': {
        brightness: 1.05, contrast: 1.05, saturate: 1.1, hue: 5, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.15, temperature: 30, tint: 10, vibrance: 15, shadow: 5, highlight: 5, gamma: 1.05, noise: 0
      },
      'warm-cozy': {
        brightness: 1.04, contrast: 1.02, saturate: 1.08, hue: 15, blur: 0.3, scale: 1,
        sepia: 8, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.12, temperature: 25, tint: 8, vibrance: 12, shadow: 8, highlight: 10, gamma: 1.03, noise: 0
      },
      'warm-fire': {
        brightness: 1.07, contrast: 1.1, saturate: 1.25, hue: 25, blur: 0, scale: 1,
        sepia: 5, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.2, temperature: 45, tint: 25, vibrance: 22, shadow: 3, highlight: 18, gamma: 1.12, noise: 0
      },
    }
  },
  {
    name: 'Cool',
    icon: '❄️',
    presets: {
      'cool-icy': {
        brightness: 1.02, contrast: 1.08, saturate: 1.05, hue: 200, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.1, temperature: -25, tint: -10, vibrance: 10, shadow: 10, highlight: -5, gamma: 1.05, noise: 0
      },
      'cool-ocean': {
        brightness: 1.03, contrast: 1.06, saturate: 1.1, hue: 190, blur: 0.1, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.12, temperature: -30, tint: -15, vibrance: 12, shadow: 12, highlight: -8, gamma: 1.06, noise: 0
      },
      'cool-mint': {
        brightness: 1.05, contrast: 1.04, saturate: 1.08, hue: 160, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.15, temperature: -20, tint: -8, vibrance: 15, shadow: 8, highlight: -3, gamma: 1.04, noise: 0
      },
      'cool-frost': {
        brightness: 1.06, contrast: 1.1, saturate: 0.95, hue: 200, blur: 0.2, scale: 1,
        sepia: 0, grayscale: 5, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.18, temperature: -35, tint: -12, vibrance: 8, shadow: 15, highlight: -10, gamma: 1.08, noise: 1
      },
      'cool-azure': {
        brightness: 1.04, contrast: 1.09, saturate: 1.12, hue: 210, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.13, temperature: -28, tint: -18, vibrance: 18, shadow: 6, highlight: -6, gamma: 1.07, noise: 0
      },
    }
  },
  {
    name: 'Food',
    icon: '🍔',
    presets: {
      'food-vibrant': {
        brightness: 1.1, contrast: 1.15, saturate: 1.4, hue: 5, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
        exposure: 0.2, temperature: 15, tint: 5, vibrance: 35, shadow: -5, highlight: 20, gamma: 1.05, noise: 0
      },
      'food-rich': {
        brightness: 1.05, contrast: 1.2, saturate: 1.3, hue: 10, blur: 0, scale: 1,
        sepia: 5, grayscale: 0, invert: 0, opacity: 1, sharpen: 8,
        exposure: 0.15, temperature: 20, tint: 8, vibrance: 30, shadow: 10, highlight: 15, gamma: 1.1, noise: 0
      },
      'food-fresh': {
        brightness: 1.12, contrast: 1.1, saturate: 1.35, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 3,
        exposure: 0.25, temperature: 10, tint: 3, vibrance: 40, shadow: -10, highlight: 25, gamma: 0.98, noise: 0
      },
      'food-appetizing': {
        brightness: 1.08, contrast: 1.18, saturate: 1.45, hue: 8, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 6,
        exposure: 0.22, temperature: 18, tint: 6, vibrance: 38, shadow: 0, highlight: 18, gamma: 1.08, noise: 0
      },
      'food-natural': {
        brightness: 1.06, contrast: 1.12, saturate: 1.25, hue: 3, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 4,
        exposure: 0.18, temperature: 12, tint: 4, vibrance: 28, shadow: 5, highlight: 12, gamma: 1.06, noise: 0
      },
    }
  },
  {
    name: 'Street',
    icon: '🏙️',
    presets: {
      'street-urban': {
        brightness: 0.95, contrast: 1.25, saturate: 1.1, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 10,
        exposure: -0.1, temperature: -10, tint: 5, vibrance: 5, shadow: 25, highlight: -20, gamma: 1.15, noise: 1
      },
      'street-gritty': {
        brightness: 0.9, contrast: 1.3, saturate: 0.95, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 10, invert: 0, opacity: 1, sharpen: 12,
        exposure: -0.15, temperature: -5, tint: 0, vibrance: 0, shadow: 35, highlight: -30, gamma: 1.2, noise: 2
      },
      'street-vibrant': {
        brightness: 1.05, contrast: 1.2, saturate: 1.4, hue: 5, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 8,
        exposure: 0.1, temperature: 8, tint: 3, vibrance: 30, shadow: 10, highlight: -5, gamma: 1.1, noise: 0
      },
      'street-noir': {
        brightness: 0.88, contrast: 1.35, saturate: 0, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 15,
        exposure: -0.2, temperature: 0, tint: 0, vibrance: 0, shadow: 40, highlight: -35, gamma: 1.25, noise: 3
      },
      'street-colorful': {
        brightness: 1.08, contrast: 1.15, saturate: 1.5, hue: 10, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
        exposure: 0.2, temperature: 12, tint: 8, vibrance: 40, shadow: 0, highlight: 15, gamma: 1.05, noise: 0
      },
    }
  },
  {
    name: 'Portrait',
    icon: '👤',
    presets: {
      'portrait-smooth': {
        brightness: 1.05, contrast: 0.98, saturate: 1.06, hue: 0, blur: 1.6, scale: 1.03,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.1, temperature: 5, tint: 0, vibrance: 10, shadow: 5, highlight: -5, gamma: 1, noise: 0
      },
      'portrait-glam': {
        brightness: 1.08, contrast: 1.12, saturate: 1.2, hue: 6, blur: 0.6, scale: 1.05,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.2, temperature: 10, tint: 5, vibrance: 20, shadow: 0, highlight: 10, gamma: 1.1, noise: 0
      },
      'portrait-natural': {
        brightness: 1.02, contrast: 1.05, saturate: 1.08, hue: 0, blur: 0.4, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.08, temperature: 3, tint: 2, vibrance: 8, shadow: 8, highlight: -3, gamma: 1.02, noise: 0
      },
      'portrait-soft': {
        brightness: 1.08, contrast: 0.92, saturate: 1.05, hue: 0, blur: 0.8, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.2, temperature: 8, tint: 5, vibrance: 8, shadow: -15, highlight: 20, gamma: 0.9, noise: 0
      },
      'portrait-dramatic': {
        brightness: 0.95, contrast: 1.25, saturate: 1.1, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
        exposure: -0.1, temperature: 5, tint: 0, vibrance: 15, shadow: 30, highlight: -25, gamma: 1.2, noise: 0
      },
    }
  },
  {
    name: 'Nature',
    icon: '🌲',
    presets: {
      'nature-vivid': {
        brightness: 1.1, contrast: 1.15, saturate: 1.5, hue: 5, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
        exposure: 0.2, temperature: 10, tint: 5, vibrance: 45, shadow: 0, highlight: 15, gamma: 1.05, noise: 0
      },
      'nature-fresh': {
        brightness: 1.12, contrast: 1.1, saturate: 1.4, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 3,
        exposure: 0.25, temperature: 8, tint: 3, vibrance: 40, shadow: -8, highlight: 22, gamma: 0.98, noise: 0
      },
      'nature-forest': {
        brightness: 0.98, contrast: 1.2, saturate: 1.2, hue: 120, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 8,
        exposure: 0.05, temperature: -8, tint: -5, vibrance: 25, shadow: 20, highlight: -10, gamma: 1.1, noise: 1
      },
      'nature-sunny': {
        brightness: 1.15, contrast: 1.08, saturate: 1.35, hue: 15, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.3, temperature: 20, tint: 10, vibrance: 35, shadow: -15, highlight: 28, gamma: 0.95, noise: 0
      },
      'nature-misty': {
        brightness: 1.05, contrast: 0.95, saturate: 0.9, hue: 0, blur: 1.2, scale: 1,
        sepia: 0, grayscale: 5, invert: 0, opacity: 0.98, sharpen: 0,
        exposure: 0.15, temperature: 5, tint: 3, vibrance: 5, shadow: -10, highlight: 15, gamma: 0.92, noise: 0
      },
    }
  },
  {
    name: 'Vintage',
    icon: '📷',
    presets: {
      'vintage-classic': {
        brightness: 0.98, contrast: 0.9, saturate: 0.85, hue: 10, blur: 0.1, scale: 1,
        sepia: 35, grayscale: 0, invert: 0, opacity: 1, sharpen: 0,
        exposure: -0.1, temperature: 20, tint: -5, vibrance: -10, shadow: 10, highlight: -15, gamma: 0.9, noise: 5
      },
      'vintage-retro': {
        brightness: 1.02, contrast: 1.1, saturate: 0.75, hue: 15, blur: 0.3, scale: 1,
        sepia: 25, grayscale: 0, invert: 0, opacity: 1, sharpen: 3,
        exposure: 0.05, temperature: 25, tint: -8, vibrance: -15, shadow: 15, highlight: -10, gamma: 0.95, noise: 3
      },
      'vintage-film': {
        brightness: 0.98, contrast: 1.15, saturate: 0.95, hue: 5, blur: 0.4, scale: 1,
        sepia: 20, grayscale: 0, invert: 0, opacity: 1, sharpen: 8,
        exposure: -0.05, temperature: 15, tint: -3, vibrance: 8, shadow: 20, highlight: -15, gamma: 1.1, noise: 4
      },
      'vintage-polaroid': {
        brightness: 1.05, contrast: 1.05, saturate: 0.8, hue: 8, blur: 0.2, scale: 1,
        sepia: 15, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
        exposure: 0.1, temperature: 18, tint: -5, vibrance: -5, shadow: 12, highlight: -8, gamma: 1.0, noise: 2
      },
      'vintage-aged': {
        brightness: 0.95, contrast: 0.88, saturate: 0.7, hue: 12, blur: 0.5, scale: 1,
        sepia: 40, grayscale: 5, invert: 0, opacity: 1, sharpen: 0,
        exposure: -0.15, temperature: 22, tint: -8, vibrance: -20, shadow: 18, highlight: -20, gamma: 0.88, noise: 6
      },
    }
  },
  {
    name: 'Cinematic',
    icon: '🎬',
    presets: {
      'cinematic-dark': {
        brightness: 0.95, contrast: 1.15, saturate: 0.9, hue: 0, blur: 0.2, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
        exposure: -0.1, temperature: -10, tint: 5, vibrance: 5, shadow: 25, highlight: -20, gamma: 1.15, noise: 1
      },
      'cinematic-dramatic': {
        brightness: 0.92, contrast: 1.35, saturate: 1.2, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 10,
        exposure: -0.15, temperature: 5, tint: 0, vibrance: 25, shadow: 40, highlight: -35, gamma: 1.25, noise: 0
      },
      'cinematic-moody': {
        brightness: 0.88, contrast: 1.2, saturate: 0.8, hue: 0, blur: 0.5, scale: 1,
        sepia: 0, grayscale: 15, invert: 0, opacity: 1, sharpen: 5,
        exposure: -0.25, temperature: -15, tint: 5, vibrance: -5, shadow: 35, highlight: -25, gamma: 1.2, noise: 2
      },
      'cinematic-epic': {
        brightness: 0.9, contrast: 1.3, saturate: 1.1, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 12,
        exposure: -0.2, temperature: -5, tint: 0, vibrance: 10, shadow: 45, highlight: -40, gamma: 1.3, noise: 1
      },
      'cinematic-color': {
        brightness: 1.0, contrast: 1.25, saturate: 1.3, hue: 5, blur: 0.1, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 8,
        exposure: 0, temperature: 8, tint: 3, vibrance: 20, shadow: 20, highlight: -15, gamma: 1.18, noise: 0
      },
    }
  },
  {
    name: 'Artistic',
    icon: '🎨',
    presets: {
      'artistic-neon': {
        brightness: 1.1, contrast: 1.2, saturate: 1.8, hue: 180, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 15,
        exposure: 0.2, temperature: -20, tint: 20, vibrance: 50, shadow: 0, highlight: 30, gamma: 1.1, noise: 0
      },
      'artistic-cyberpunk': {
        brightness: 1.05, contrast: 1.3, saturate: 1.4, hue: 240, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 20,
        exposure: 0.1, temperature: -30, tint: 30, vibrance: 40, shadow: 20, highlight: -15, gamma: 1.3, noise: 1
      },
      'artistic-pastel': {
        brightness: 1.15, contrast: 0.88, saturate: 0.7, hue: 0, blur: 1.0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 0.98, sharpen: 0,
        exposure: 0.35, temperature: 12, tint: 8, vibrance: -10, shadow: -20, highlight: 25, gamma: 0.88, noise: 0
      },
      'artistic-pop': {
        brightness: 1.1, contrast: 1.15, saturate: 1.6, hue: 10, blur: 0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 5,
        exposure: 0.2, temperature: 10, tint: 5, vibrance: 45, shadow: 0, highlight: 15, gamma: 1.05, noise: 0
      },
      'artistic-abstract': {
        brightness: 1.08, contrast: 1.25, saturate: 1.7, hue: 60, blur: 0.3, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 1, sharpen: 8,
        exposure: 0.22, temperature: 15, tint: 12, vibrance: 50, shadow: 5, highlight: 20, gamma: 1.12, noise: 0
      },
    }
  },
  {
    name: 'Black & White',
    icon: '⚫',
    presets: {
      'bw-classic': {
        brightness: 1.0, contrast: 1.2, saturate: 0, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 8,
        exposure: 0, temperature: 0, tint: 0, vibrance: 0, shadow: 20, highlight: -15, gamma: 1.15, noise: 1
      },
      'bw-noir': {
        brightness: 0.9, contrast: 1.3, saturate: 0, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 0,
        exposure: -0.2, temperature: 0, tint: 0, vibrance: 0, shadow: 30, highlight: -30, gamma: 1.1, noise: 2
      },
      'bw-high-contrast': {
        brightness: 1.05, contrast: 1.4, saturate: 0, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 15,
        exposure: 0.1, temperature: 0, tint: 0, vibrance: 0, shadow: 25, highlight: -20, gamma: 1.25, noise: 0
      },
      'bw-soft': {
        brightness: 1.1, contrast: 1.0, saturate: 0, hue: 0, blur: 0.5, scale: 1,
        sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 0,
        exposure: 0.2, temperature: 0, tint: 0, vibrance: 0, shadow: 10, highlight: -5, gamma: 0.95, noise: 0
      },
      'bw-dramatic': {
        brightness: 0.85, contrast: 1.5, saturate: 0, hue: 0, blur: 0, scale: 1,
        sepia: 0, grayscale: 100, invert: 0, opacity: 1, sharpen: 20,
        exposure: -0.3, temperature: 0, tint: 0, vibrance: 0, shadow: 50, highlight: -45, gamma: 1.4, noise: 1
      },
    }
  },
  {
    name: 'Dreamy',
    icon: '✨',
    presets: {
      'dreamy-soft': {
        brightness: 1.1, contrast: 0.95, saturate: 1.15, hue: 0, blur: 1.2, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 0.95, sharpen: 0,
        exposure: 0.3, temperature: 15, tint: 10, vibrance: 15, shadow: -10, highlight: 15, gamma: 0.95, noise: 0
      },
      'dreamy-ethereal': {
        brightness: 1.12, contrast: 0.9, saturate: 1.1, hue: 0, blur: 1.5, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 0.92, sharpen: 0,
        exposure: 0.4, temperature: 10, tint: 12, vibrance: 12, shadow: -25, highlight: 30, gamma: 0.85, noise: 0
      },
      'dreamy-romantic': {
        brightness: 1.08, contrast: 0.92, saturate: 1.2, hue: 5, blur: 1.0, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 0.96, sharpen: 0,
        exposure: 0.25, temperature: 18, tint: 8, vibrance: 18, shadow: -12, highlight: 22, gamma: 0.9, noise: 0
      },
      'dreamy-misty': {
        brightness: 1.06, contrast: 0.88, saturate: 1.05, hue: 0, blur: 1.4, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 0.94, sharpen: 0,
        exposure: 0.35, temperature: 12, tint: 10, vibrance: 10, shadow: -18, highlight: 25, gamma: 0.88, noise: 0
      },
      'dreamy-glow': {
        brightness: 1.15, contrast: 0.9, saturate: 1.25, hue: 0, blur: 0.8, scale: 1,
        sepia: 0, grayscale: 0, invert: 0, opacity: 0.98, sharpen: 0,
        exposure: 0.45, temperature: 20, tint: 15, vibrance: 20, shadow: -30, highlight: 35, gamma: 0.82, noise: 0
      },
    }
  },
];

// Flatten all presets for backward compatibility
export const ALL_PRESETS: Record<string, FilterSettings> = PRESET_CATEGORIES.reduce((acc, category) => {
  Object.entries(category.presets).forEach(([key, value]) => {
    acc[key] = value;
  });
  return acc;
}, {} as Record<string, FilterSettings>);

