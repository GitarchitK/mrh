/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#18264B',
          'navy-dark': '#0E1730',
          'navy-light': '#243769',
          'navy-surface': '#1F315E',
          orange: '#F15B45',
          'orange-hover': '#DC4833',
          'orange-light': '#FEECE9',
          'orange-glow': 'rgba(241, 91, 69, 0.35)',
          light: '#F3F5F9',
          text: '#172033',
          secondary: '#697386',
          border: '#E2E7EF',
          muted: '#EEF1F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -3px rgba(241, 91, 69, 0.35), 0 4px 12px -2px rgba(241, 91, 69, 0.2)',
        'glow-navy': '0 0 25px -3px rgba(24, 38, 75, 0.35), 0 4px 12px -2px rgba(24, 38, 75, 0.2)',
        'card-hover': '0 12px 30px -10px rgba(24, 38, 75, 0.12), 0 4px 10px -2px rgba(24, 38, 75, 0.06)',
        'premium': '0 20px 40px -15px rgba(24, 38, 75, 0.08), 0 0 1px 1px rgba(226, 231, 239, 0.8)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2.5s infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(8px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px 0px rgba(241, 91, 69, 0.3)' },
          '50%': { boxShadow: '0 0 28px 5px rgba(241, 91, 69, 0.55)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
