import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2952E3',
          blueLight: '#5B7CFA',
          purple: '#8B5CF6',
          purpleDeep: '#6D28D9',
          ink: '#0B1030',
          mist: '#F5F6FF',
        },
      },
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'bridge-gradient': 'linear-gradient(135deg, #2952E3 0%, #6D28D9 100%)',
        'bridge-radial': 'radial-gradient(circle at 20% 20%, rgba(91,124,250,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(139,92,246,0.25), transparent 40%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(41, 82, 227, 0.15)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
