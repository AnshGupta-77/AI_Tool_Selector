import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#0a0a0f',
          surface: '#111118',
          elevated:'#16161f',
          border:  '#1e1e2e',
        },
        accent: {
          primary:   '#6366f1',
          secondary: '#a78bfa',
          glow:      'rgba(99,102,241,0.12)',
        },
        pricing: {
          free:     '#22c55e',
          freemium: '#f59e0b',
          paid:     '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // Animations are defined in index.css — only declare the class names here
      animation: {
        'fade-up':     'fade-up 0.4s ease-out both',
        'fade-in':     'fade-in 0.3s ease-out both',
        'glow-pulse':  'glow-pulse 2.5s ease-in-out infinite',
        'spin-slow':   'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
