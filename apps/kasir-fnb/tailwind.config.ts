import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF5F1F",
          "primary-light": "#FF7A42",
          "primary-dark": "#F04006",
          secondary: "#F7A237",
          accent: "#FFCE55",
          dark: "#0D0D0D",
        },
        pos: {
          bg: "#F5F5F5",
          surface: "#FFFFFF",
          border: "#E5E5E5",
          "cart-bg": "#FAFAFA",
          "header-bg": "#0D0D0D",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        table: {
          available: "#22C55E",
          occupied: "#EF4444",
          reserved: "#F59E0B",
          billing: "#8B5CF6",
        },
        kitchen: {
          new: "#3B82F6",
          preparing: "#F59E0B",
          ready: "#22C55E",
          served: "#6B7280",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
      },
      minHeight: {
        "touch": "44px",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 95, 31, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255, 95, 31, 0)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
