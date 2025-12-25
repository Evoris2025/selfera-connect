import React, { createContext, useContext, useEffect, useState } from 'react';

export type ColorTheme = 'coral' | 'ocean' | 'rose' | 'forest' | 'violet';

interface ThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'selfera-color-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['coral', 'ocean', 'rose', 'forest', 'violet'].includes(stored)) {
        return stored as ColorTheme;
      }
    }
    return 'coral';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-coral', 'theme-ocean', 'theme-rose', 'theme-forest', 'theme-violet');
    
    // Add the current theme class
    root.classList.add(`theme-${theme}`);
    
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
