import type { Config } from 'tailwindcss';

/**
 * Дизайн-система Profik.kz (Том 2, п. 2.4.1; Том 4).
 * Тёмный фон, металл и бетон, красный акцент строго дозирован.
 * Брейкпоинты — из Тома 2, п. 2.10 (проектирование с 375px вверх).
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    // container до 1600px — Том 2, п. 2.10 (не растягиваем шире)
    screens: {
      xs: '480px',
      sm: '768px',
      md: '1024px',
      lg: '1440px',
      xl: '1920px',
    },
    extend: {
      colors: {
        // Металл и бетон — тёмная база
        ink: {
          950: '#0a0a0b',
          900: '#101012',
          800: '#17181b',
          700: '#1f2126',
          600: '#2a2d33',
          500: '#3a3e46',
        },
        steel: {
          400: '#8b9099',
          300: '#a9aeb6',
          200: '#c9ccd2',
          100: '#e6e8eb',
        },
        // Красный акцент — единственный акцентный цвет (собственные CTA)
        accent: {
          DEFAULT: '#e11d2a',
          600: '#c81622',
          500: '#e11d2a',
          400: '#f0323f',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        container: '1600px',
      },
      keyframes: {
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sheen: {
          '0%': { transform: 'translateX(-130%) skewX(-12deg)' },
          '60%,100%': { transform: 'translateX(160%) skewX(-12deg)' },
        },
      },
      animation: {
        // баннер категории: медленный зум 8с ease-out (Том 2, п. 2.4.1)
        'slow-zoom': 'slow-zoom 8s ease-out forwards',
        // герой: сдвиг снизу вверх 500мс (Том 4, п. 4.2)
        'rise-in': 'rise-in 500ms ease-out both',
        // тонкий световой блик по герою
        sheen: 'sheen 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
