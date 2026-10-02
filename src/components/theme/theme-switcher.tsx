'use client';

import { themes, type ThemeName } from '@/lib/themes';

import { useTheme } from './theme-provider';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(Object.keys(themes) as ThemeName[]).map((themeName) => {
        const isActive = theme === themeName;

        return (
          <button
            key={themeName}
            type="button"
            onClick={() => setTheme(themeName)}
            aria-pressed={isActive}
            className={`
              rounded-lg border px-4 py-2.5 text-sm font-semibold
              transition-all duration-200
              ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:bg-secondary'
              }
            `}
          >
            {themes[themeName].name}
          </button>
        );
      })}
    </div>
  );
}
