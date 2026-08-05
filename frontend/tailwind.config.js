/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Serif Bengali"', 'serif'],
        serif: ['"Noto Serif Bengali"', 'serif'],
        display: ['"Noto Serif Bengali"', 'serif']
      },
      colors: {
        ink: '#141321',
        coral: '#ff5f45',
        river: '#0071b8',
        sand: '#f8f2e7',
        mint: '#c6f2e5'
      },
      boxShadow: {
        card: '0 18px 36px -20px rgba(20,19,33,.35)'
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        ticker: 'ticker 52s linear infinite',
        floatIn: 'floatIn .7s ease-out forwards'
      }
    }
  },
  plugins: []
}
