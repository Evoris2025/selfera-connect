import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeColor {
  /** Wrapped HSL color string ready for CSS, e.g. "hsl(12 76% 61%)". */
  primary: string;
  /** Raw HSL components, e.g. "12 76% 61%". Useful for color-mix / opacity. */
  primaryRaw: string;
  /** Brand gradient stops, raw HSL components. */
  gradientStops: { start: string; mid: string; end: string };
}

const EMPTY: ThemeColor = {
  primary: 'hsl(0 0% 0%)',
  primaryRaw: '0 0% 0%',
  gradientStops: { start: '0 0% 0%', mid: '0 0% 0%', end: '0 0% 0%' },
};

function readVar(name: string): string {
  if (typeof window === 'undefined') return '';
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v;
}

function readThemeColor(): ThemeColor {
  if (typeof window === 'undefined') return EMPTY;
  const primaryRaw = readVar('--primary') || EMPTY.primaryRaw;
  return {
    primary: `hsl(${primaryRaw})`,
    primaryRaw,
    gradientStops: {
      start: readVar('--gradient-start') || EMPTY.gradientStops.start,
      mid: readVar('--gradient-mid') || EMPTY.gradientStops.mid,
      end: readVar('--gradient-end') || EMPTY.gradientStops.end,
    },
  };
}

/**
 * Returns the active theme's primary color and brand-gradient stops.
 * Re-reads from the document's computed style whenever the ThemeContext value
 * changes (theme-coral / -ocean / -rose / -forest / -violet).
 *
 * Use for inline styles (rings, edge strokes, computed accents) where Tailwind
 * classes referencing hsl(var(--primary)) won't fit.
 */
export function useThemeColor(): ThemeColor {
  // Subscribe to ThemeContext so this hook re-runs on theme switch.
  const { theme } = useTheme();
  const [color, setColor] = useState<ThemeColor>(() => readThemeColor());

  const refresh = useCallback(() => setColor(readThemeColor()), []);

  useEffect(() => {
    // Theme class is applied in a useEffect inside ThemeProvider; defer one
    // frame so computed styles reflect the new class.
    const id = requestAnimationFrame(refresh);
    return () => cancelAnimationFrame(id);
  }, [theme, refresh]);

  return color;
}
