'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { defaultTheme, themes, type ThemeName } from '@/lib/themes';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  readonly theme: ThemeName;
  readonly setTheme: (theme: ThemeName) => void;
  readonly mode: ThemeMode;
  readonly setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  readonly children: ReactNode;
};

function isValidTheme(value: string | null): value is ThemeName {
  return value !== null && value in themes;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme);
  const [mode, setMode] = useState<ThemeMode>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const savedTheme = localStorage.getItem('socio-theme');
      const savedMode = localStorage.getItem('socio-theme-mode');
      const nextTheme = isValidTheme(savedTheme) ? savedTheme : defaultTheme;
      const nextMode: ThemeMode = savedMode === 'dark' ? 'dark' : 'light';

      if (nextTheme !== theme) setTheme(nextTheme);
      if (nextMode !== mode) setMode(nextMode);
      setHydrated(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [theme, mode]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themeMode = mode;
    localStorage.setItem('socio-theme', theme);
    localStorage.setItem('socio-theme-mode', mode);
  }, [hydrated, theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
