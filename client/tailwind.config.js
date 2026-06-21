/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#14182B',
        sand: '#F6F1E7',
        clay: '#C75D3B',
        gold: '#D8A93B',
        teal: '#1F6F6B',
        slate: '#5B6072',
        line: '#E4DCC9',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', '"Noto Sans Arabic"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
