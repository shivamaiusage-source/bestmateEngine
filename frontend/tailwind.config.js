export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0a1a0f',
          secondary: '#0f2318',
          tertiary:  '#152d1e',
          hover:     '#1a3d28',
          active:    '#1f4f32',
        },
        accent: {
          primary: '#8dc63f',
          light:   '#a8d94f',
        },
        text: {
          primary:   '#e8f5e2',
          secondary: '#7aad6a',
          muted:     '#4a6b42',
        },
        status: {
          success: '#4ade80',
          warning: '#fbbf24',
          danger:  '#f87171',
          info:    '#60a5fa',
        },
        border: {
          subtle:  'rgba(141,198,63,0.12)',
          default: 'rgba(141,198,63,0.25)',
          strong:  'rgba(141,198,63,0.5)',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        data:    ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'spin-slow':   'spin 8s linear infinite',
        'spin-medium': 'spin 4.8s linear infinite reverse',
        'spin-fast':   'spin 3.4s linear infinite',
        'float-up':    'floatUp 4s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'orbit':       'orbit 10s linear infinite',
        'dash-flow':   'dashFlow 2s linear infinite',
        'fade-in':     'fadeIn 0.5s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
      },
      keyframes: {
        floatUp: {
          '0%,100%': { transform: 'translateY(0)',    opacity: '0.4' },
          '50%':     { transform: 'translateY(-20px)', opacity: '1'   },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 10px rgba(141,198,63,0.2)' },
          '50%':     { boxShadow: '0 0 30px rgba(141,198,63,0.6)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg)   translateX(80px) rotate(0deg)'  },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
        dashFlow: {
          '0%':   { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0'   },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
      },
    },
  },
  plugins: [],
}
