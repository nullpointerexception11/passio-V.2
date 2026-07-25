/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Design Tokens for PASSIO
 * Single source of truth for layout, spatial math, typography, and visual systems.
 */

export const DESIGN_TOKENS = {
  // 1. Spacing System: 4px grid base
  spacing: {
    xs: '4px',    // 0.25rem
    sm: '8px',    // 0.5rem
    md: '12px',   // 0.75rem
    lg: '16px',   // 1rem (Base Layout Margin)
    xl: '24px',   // 1.5rem
    xxl: '32px',  // 2rem
    huge: '48px', // 3rem
    epic: '64px', // 4rem
  },

  // 2. Corner Radii (Max 12-16px for cards, pills have custom high values)
  radius: {
    none: '0px',
    sharp: '2px',
    subtle: '4px',
    medium: '8px',
    card: '12px',
    pill: '9999px',
  },

  // 3. Typographic Scale (Low contrast ratio ~1.125 Major Second for dense yet elegant app typography)
  typography: {
    fontFamily: {
      display: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    size: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px (Minimum readable body)
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      h3: '1.5rem',     // 24px
      h2: '1.875rem',   // 30px
      h1: '2.25rem',    // 36px
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.7', // Optimum readability for body text (65-75 chars wide)
    },
    tracking: {
      tight: '-0.02em',
      normal: '0em',
      wide: '0.03em',
      widest: '0.08em',
    },
  },

  // 4. Animation and Motion - Extremely subtle, silent, and fast transitions
  motion: {
    duration: {
      instant: '0ms',
      fast: '150ms',   // Tiny state changes, hover effects
      normal: '300ms', // Route transitions, sidebar toggles
      slow: '500ms',   // Distraction-free mode entries
    },
    easing: {
      standard: 'cubic-bezier(0.16, 1, 0.3, 1)', // Ultra-premium ease-out (exponential look)
      linear: 'linear',
    },
  },

  // 5. Elevation (Z-index Stack)
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    sidebar: 40,
    modal: 50,
    tooltip: 60,
  },

  // 6. Natural Sophisticated Shadows (Minimal, organic, soft)
  shadows: {
    none: 'none',
    subtle: '0 2px 8px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.06)',
    premium: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: '0 0 0 1px rgba(0, 0, 0, 0.03)', // Elegant tactile borders
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
