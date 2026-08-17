/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1B33',
          light: '#1B2A4A',
          dark: '#0A1224'
        },
        blue: {
          accent: '#3D6BFF'
        },
        coral: {
          DEFAULT: '#FF7A47',
          light: '#FFA07A'
        },
        surface: '#F6F7FB',
        line: '#E7EAF2'
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 27, 51, 0.04), 0 8px 24px rgba(15, 27, 51, 0.06)',
        cardHover: '0 4px 10px rgba(15, 27, 51, 0.06), 0 16px 32px rgba(15, 27, 51, 0.10)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.15)' }
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.35s ease-out'
      }
    }
  },
  plugins: []
};
