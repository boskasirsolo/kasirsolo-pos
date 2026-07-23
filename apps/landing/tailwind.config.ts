import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5F1F',
          hover: '#FF7A3D',
          soft: '#FFF1E8',
          gold: '#FFCE55',
          dark: '#0D0D0D',
          'dark-soft': '#1A1A1A',
          success: '#16A34A',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
