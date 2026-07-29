/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#0D1117',
          800: '#161B22',
          700: '#21262D',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F3EDDF',
          300: '#E8E2D8',
        },
        gold: {
          400: '#D4AF37',
          500: '#C5A059',
          600: '#B08B44',
          700: '#8C6C2B',
        },
        terracotta: {
          500: '#9E4730',
          600: '#843823',
        },
        indigo: {
          900: '#1A233D',
          800: '#243054',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(13, 17, 23, 0.1)',
        'gold-glow': '0 0 20px rgba(197, 160, 89, 0.25)',
      }
    },
  },
  plugins: [],
}
