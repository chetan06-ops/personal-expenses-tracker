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
        background: '#070B12', // deep obsidian slate
        surface: {
          DEFAULT: '#0D131F',
          elevated: '#131B2C',
          light: '#182236',
          dark: '#05080F',
          glass: 'rgba(13, 19, 31, 0.85)',
        },
        brand: {
          cyan: '#06B6D4',
          sky: '#0EA5E9',
          violet: '#8B5CF6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
          blue: '#3B82F6',
        },
        navy: {
          950: '#05080F',
          900: '#070B12',
          850: '#0D131F',
          800: '#131B2C',
          700: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.35), 0 8px 24px -10px rgba(0, 0, 0, 0.5)',
        'elevated': '0 12px 32px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(148, 163, 184, 0.1)',
        'glow-cyan': '0 0 24px -6px rgba(6, 182, 212, 0.25)',
        'glow-violet': '0 0 24px -6px rgba(139, 92, 246, 0.25)',
        'glow-emerald': '0 0 24px -6px rgba(16, 185, 129, 0.25)',
        'glass': '0 8px 30px -6px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit': 'spin 30s linear infinite',
      }
    },
  },
  plugins: [],
}
