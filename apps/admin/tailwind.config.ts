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
          secondary: "#F7A237",
          dark: "#0D0D0D",
        },
        sidebar: {
          bg: "#0D0D0D",
          hover: "#1A1A1A",
          active: "#2A1A0F",
          border: "#262626",
          text: "#A3A3A3",
          "text-active": "#FFFFFF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
