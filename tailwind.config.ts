import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#f8f8f0',
        island: '#19c8b9',
        bark: '#725d42'
      },
      fontFamily: {
        island: [
          'Nunito',
          'Noto Sans SC',
          'Zen Maru Gothic',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
};

export default config;
