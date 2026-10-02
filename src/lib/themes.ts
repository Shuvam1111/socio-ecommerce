export const themes = {
  violet: {
    name: 'Violet',
    description: 'Modern luxury',
  },
  emerald: {
    name: 'Emerald',
    description: 'Fresh and premium',
  },
  rose: {
    name: 'Rose',
    description: 'Elegant and stylish',
  },
} as const;

export type ThemeName = keyof typeof themes;

export const defaultTheme: ThemeName = 'violet';
