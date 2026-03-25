import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        unergy: {
          50: '#f0fdf7',
          100: '#dcfcec',
          200: '#bbf7d8',
          300: '#86efba',
          400: '#4ade94',
          500: '#00b85c',
          600: '#009e4f',
          700: '#007d3d',
          800: '#006332',
          900: '#004d27',
          950: '#0B1120',
        },
      },
    },
  },
} satisfies Config
