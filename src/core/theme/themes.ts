/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DESIGN_TOKENS } from './tokens';

export type ColorPalette = {
  background: {
    base: string;        // Main layout background
    surface: string;     // Cards, active editor pane
    sidebar: string;     // Side navigation / library view
    input: string;       // Text entry inputs
    hover: string;       // Interactive hover states
    active: string;      // Selection or active element
  };
  text: {
    primary: string;     // Main body and titles (high contrast)
    secondary: string;   // Secondary info, helper text
    muted: string;       // Placeholders, disabled states
    accent: string;      // Premium focus elements
  };
  border: {
    subtle: string;      // Standard hairline dividers (1px)
    strong: string;      // Focused elements / border highlights
  };
  accent: {
    base: string;        // Core luxury accent color
    muted: string;       // Background tinted accent
  };
};

export const PREMIUM_WHITE_THEME: ColorPalette = {
  background: {
    base: '#F9F9F6',      // Warm tactile linen off-white (easy on eyes)
    surface: '#FFFFFF',   // Pure paper white (Z-index elevation)
    sidebar: '#F2F2ED',   // Darker paper tint for structure
    input: '#F4F4EE',     // Soft recessed entry fields
    hover: '#EAEAE2',     // Organic hover state
    active: '#E2E2D7',    // Focus or active select
  },
  text: {
    primary: '#1C1C1A',   // Deep graphite charcoal (not pure black)
    secondary: '#5D5D57', // Muted slate gray
    muted: '#9E9E94',     // Subdued tactile text
    accent: '#8C7A5B',    // Muted linen bronze
  },
  border: {
    subtle: '#E8E8DF',    // Sophisticated soft border line
    strong: '#8C7A5B',    // Focus border
  },
  accent: {
    base: '#8C7A5B',      // Earth-tinted gold-bronze
    muted: '#F0EBE0',     // Gentle warm accent backdrop
  },
};

export const PREMIUM_BLACK_THEME: ColorPalette = {
  background: {
    base: '#0D0D0D',      // Deep warm obsidian (soft on eyes)
    surface: '#151515',   // Elevated charcoal background (<12% brightness jump)
    sidebar: '#111111',   // Recessed structural nav
    input: '#1A1A1A',     // Recessed text area
    hover: '#222222',     // Fine charcoal hover highlight
    active: '#2A2A2A',    // Active selection
  },
  text: {
    primary: '#F4F4F1',   // Warm soft paper white
    secondary: '#9D9D96', // Warm silver-gray
    muted: '#5F5F59',     // Deep slate charcoal
    accent: '#D4AF37',    // High-end warm champagne gold
  },
  border: {
    subtle: '#222222',    // Subtle graphite hairline
    strong: '#D4AF37',    // Luxury accent border
  },
  accent: {
    base: '#D4AF37',      // Warm gold champagne
    muted: '#282315',     // Recessed rich gold tint
  },
};

export const THEMES = {
  light: PREMIUM_WHITE_THEME,
  dark: PREMIUM_BLACK_THEME,
} as const;

export type ThemeType = keyof typeof THEMES;
