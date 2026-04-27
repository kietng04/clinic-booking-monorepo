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
        brand: {
          50: '#eef6f3',
          100: '#d7e7df',
          200: '#b6d0c2',
          300: '#8cb39d',
          400: '#678f78',
          500: '#4e7460',
          600: '#3e5f4d',
          700: '#324c3e',
          800: '#2a3e33',
          900: '#24352b',
          950: '#161f19',
        },
        sage: {
          50: '#f5f8f6',
          100: '#e7eeea',
          200: '#d4ded8',
          300: '#b4c4bb',
          400: '#90a798',
          500: '#6f8d79',
          600: '#56705f',
          700: '#45594c',
          800: '#37473d',
          900: '#2b362f',
          950: '#1c241f',
        },
        terra: {
          50: '#fbf7f4',
          100: '#f2e7e0',
          200: '#e6d2c6',
          300: '#d4b6a3',
          400: '#bd937c',
          500: '#a77762',
          600: '#8f624f',
          700: '#734f41',
          800: '#5d4137',
          900: '#4c352d',
        },
        cream: {
          50: '#fffdf9',
          100: '#fbf7f1',
          200: '#f4ede3',
          300: '#eadfce',
          400: '#dcccb4',
          500: '#c8b397',
          600: '#b19777',
          700: '#927b60',
          800: '#76634d',
          900: '#5f503f',
        },
        wellness: {
          primary: '#246ae9',
          secondary: '#475569',
          accent: '#0ea5e9',
          background: '#f8fafc',
          surface: '#ffffff',
        }
      },
      fontFamily: {
        display: ['Instrument Sans', 'system-ui', 'sans-serif'],
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'organic': '24px',
        'soft': '16px',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(43, 54, 47, 0.05), 0 10px 28px rgba(43, 54, 47, 0.06)',
        'glow': '0 0 0 1px rgba(78, 116, 96, 0.14)',
        'float': '0 18px 42px rgba(43, 54, 47, 0.10)',
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
      },
      keyframes: {
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
