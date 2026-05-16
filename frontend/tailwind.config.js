/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm, organic wellness palette
        sage: {
          50: '#f6f8f6',
          100: '#e3e9e3',
          200: '#c7d3c8',
          300: '#a2b5a4',
          400: '#7a947d',
          500: '#5d7a60',
          600: '#48614b',
          700: '#3a4d3d',
          800: '#303f32',
          900: '#29352b',
          950: '#1a2219',
        },
        terra: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f1ea',
          300: '#ebe4d7',
          400: '#ddd2bf',
          500: '#c9b99e',
          600: '#b39f7e',
          700: '#9d8763',
          800: '#826f53',
          900: '#6b5c46',
        },
        wellness: {
          primary: '#5d7a60',
          secondary: '#bfa094',
          accent: '#d2bab0',
          background: '#fdfcfb',
          surface: '#f5f1ea',
        }
      },
      fontFamily: {
        display: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'organic': '32% 68% 68% 32% / 64% 36% 64% 36%',
        'soft': '24px',
      },
      boxShadow: {
        'soft': '0 8px 32px rgba(93, 122, 96, 0.08)',
        'glow': '0 0 32px rgba(191, 160, 148, 0.15)',
        'float': '0 16px 48px rgba(93, 122, 96, 0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
