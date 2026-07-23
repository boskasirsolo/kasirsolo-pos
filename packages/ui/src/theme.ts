/**
 * KASIRSOLO Design Tokens
 * Brand colors, typography, spacing, shadows, and radii.
 */

export const colors = {
  primary: {
    50: "#FFF3ED",
    100: "#FFE4D6",
    200: "#FFC5AC",
    300: "#FF9E77",
    400: "#FF7A42",
    500: "#FF5F1F", // Brand primary
    600: "#F04006",
    700: "#C72F07",
    800: "#9E260E",
    900: "#7F220F",
  },
  secondary: {
    50: "#FFFBEB",
    100: "#FFF4C6",
    200: "#FFE888",
    300: "#FFD84A",
    400: "#FFCE55", // Brand accent
    500: "#F7A237", // Brand secondary
    600: "#DB7A12",
    700: "#B6560B",
    800: "#944310",
    900: "#7A3811",
  },
  accent: {
    50: "#FFFDF0",
    100: "#FFFADB",
    200: "#FFF5B8",
    300: "#FFED8A",
    400: "#FFCE55", // Brand accent
    500: "#FFB520",
    600: "#E69500",
    700: "#BF7000",
    800: "#995808",
    900: "#7D480B",
  },
  dark: {
    50: "#F5F5F5",
    100: "#E5E5E5",
    200: "#CCCCCC",
    300: "#A3A3A3",
    400: "#737373",
    500: "#525252",
    600: "#404040",
    700: "#2D2D2D",
    800: "#1A1A1A",
    900: "#0D0D0D", // Brand dark
  },
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
  },
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
  },
  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
  },
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const fonts = {
  heading: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
} as const;

export const fontSizes = {
  xs: "0.75rem",    // 12px
  sm: "0.875rem",   // 14px
  base: "1rem",     // 16px
  lg: "1.125rem",   // 18px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  "3xl": "1.875rem",// 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem",    // 48px
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
} as const;

export const radii = {
  none: "0",
  sm: "0.25rem",    // 4px
  md: "0.5rem",     // 8px
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  "2xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  card: "0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.06)",
  elevated: "0 4px 12px rgb(0 0 0 / 0.12)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const transitions = {
  fast: "150ms ease",
  normal: "200ms ease",
  slow: "300ms ease",
  spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

/** Full theme object for convenience. */
export const theme = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  radii,
  shadows,
  breakpoints,
  transitions,
  zIndex,
} as const;

export type Theme = typeof theme;
