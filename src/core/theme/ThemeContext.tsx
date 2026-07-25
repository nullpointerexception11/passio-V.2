/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, ThemeType, ColorPalette } from './themes';
import { DESIGN_TOKENS } from './tokens';

export type PdfReadingMode = 'original' | 'dark' | 'sepia';

export interface ReadingModeOption {
  id: PdfReadingMode;
  label: string;
  description: string;
}

export const READING_MODES: ReadingModeOption[] = [
  {
    id: 'original',
    label: 'Orijinal',
    description: 'PDF tamamen orijinal doğal renklerinde gösterilir.',
  },
  {
    id: 'dark',
    label: 'Karanlık Okuma',
    description: 'Uzun gece okumaları için göz yormayan özel koyu mod.',
  },
  {
    id: 'sepia',
    label: 'Sepya Okuma',
    description: 'Göz yormayan sıcak sarı-kağıt tonları ile dinlendirici okuma.',
  },
];

interface ThemeContextProps {
  themeType: ThemeType;
  theme: ColorPalette;
  pdfReadingMode: PdfReadingMode;
  setThemeType: (type: ThemeType) => void;
  toggleTheme: () => void;
  setPdfReadingMode: (mode: PdfReadingMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [themeType, setThemeTypeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('passio-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  // Initialize PDF reading mode from localStorage
  const [pdfReadingMode, setPdfReadingModeState] = useState<PdfReadingMode>(() => {
    const saved = localStorage.getItem('passio-pdf-reading-mode');
    if (saved === 'original' || saved === 'dark' || saved === 'sepia') return saved;
    return 'original';
  });

  const theme = THEMES[themeType];

  const setThemeType = (newTheme: ThemeType) => {
    setThemeTypeState(newTheme);
    localStorage.setItem('passio-theme', newTheme);
  };

  const toggleTheme = () => {
    setThemeType(themeType === 'light' ? 'dark' : 'light');
  };

  const setPdfReadingMode = (mode: PdfReadingMode) => {
    setPdfReadingModeState(mode);
    localStorage.setItem('passio-pdf-reading-mode', mode);
  };

  // Synchronize CSS variables and classes on the HTML element
  useEffect(() => {
    const root = document.documentElement;
    
    // Toggle dark class for Tailwind
    if (themeType === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Set CSS custom properties from design tokens & active theme
    // 1. Core Palette variables
    const palette = THEMES[themeType];
    root.style.setProperty('--color-bg-base', palette.background.base);
    root.style.setProperty('--color-bg-surface', palette.background.surface);
    root.style.setProperty('--color-bg-sidebar', palette.background.sidebar);
    root.style.setProperty('--color-bg-input', palette.background.input);
    root.style.setProperty('--color-bg-hover', palette.background.hover);
    root.style.setProperty('--color-bg-active', palette.background.active);

    root.style.setProperty('--color-text-primary', palette.text.primary);
    root.style.setProperty('--color-text-secondary', palette.text.secondary);
    root.style.setProperty('--color-text-muted', palette.text.muted);
    root.style.setProperty('--color-text-accent', palette.text.accent);

    root.style.setProperty('--color-border-subtle', palette.border.subtle);
    root.style.setProperty('--color-border-strong', palette.border.strong);

    root.style.setProperty('--color-accent-base', palette.accent.base);
    root.style.setProperty('--color-accent-muted', palette.accent.muted);

    // 2. Spatial/Layout variables from DESIGN_TOKENS
    Object.entries(DESIGN_TOKENS.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(DESIGN_TOKENS.radius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // 3. Typography size variables
    Object.entries(DESIGN_TOKENS.typography.size).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // 4. Transitions
    Object.entries(DESIGN_TOKENS.motion.duration).forEach(([key, value]) => {
      root.style.setProperty(`--motion-duration-${key}`, value);
    });

  }, [themeType]);

  return (
    <ThemeContext.Provider value={{ themeType, theme, pdfReadingMode, setThemeType, toggleTheme, setPdfReadingMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
