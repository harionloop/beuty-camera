'use client';

import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-btn"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="relative flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        width: '52px',
        height: '28px',
        borderRadius: '999px',
        background: isDark
          ? 'linear-gradient(135deg, #2a1f3d, #1a1428)'
          : 'linear-gradient(135deg, #f4a07a, #e07b54)',
        border: `2px solid ${isDark ? 'rgba(180,140,255,0.3)' : 'rgba(224,123,84,0.4)'}`,
        boxShadow: isDark
          ? '0 2px 10px rgba(100,60,180,0.3), inset 0 1px 3px rgba(0,0,0,0.3)'
          : '0 2px 10px rgba(224,123,84,0.3), inset 0 1px 3px rgba(255,200,150,0.2)',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Track icons */}
      <span
        className="absolute left-1.5 text-xs transition-opacity duration-300"
        style={{ opacity: isDark ? 1 : 0, fontSize: '11px' }}
      >🌙</span>
      <span
        className="absolute right-1.5 text-xs transition-opacity duration-300"
        style={{ opacity: isDark ? 0 : 1, fontSize: '11px' }}
      >☀️</span>

      {/* Thumb */}
      <span
        className="absolute transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          left: isDark ? '28px' : '3px',
        }}
      />
    </button>
  );
}
