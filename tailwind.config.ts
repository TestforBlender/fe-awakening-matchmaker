import type { Config } from 'tailwindcss';

/**
 * Fire Emblem Awakening palette.
 * Colors are wired to CSS variables (see src/styles/index.css) so light/dark
 * mode is a single source of truth and components never hard-code hex values.
 *
 * The world we're drawing from: the Awakening menu UI — deep indigo-navy panels,
 * brushed-gold filigree and rank/seal accents, aged-parchment surfaces, a regal
 * crimson for danger/"no match", and a softer rose used only for a valid pairing.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surfaces
        navy: {
          DEFAULT: 'rgb(var(--fe-navy) / <alpha-value>)',
          deep: 'rgb(var(--fe-navy-deep) / <alpha-value>)',
          panel: 'rgb(var(--fe-navy-panel) / <alpha-value>)',
        },
        parchment: {
          DEFAULT: 'rgb(var(--fe-parchment) / <alpha-value>)',
          dim: 'rgb(var(--fe-parchment-dim) / <alpha-value>)',
        },
        // Accents
        gold: {
          DEFAULT: 'rgb(var(--fe-gold) / <alpha-value>)',
          bright: 'rgb(var(--fe-gold-bright) / <alpha-value>)',
          dim: 'rgb(var(--fe-gold-dim) / <alpha-value>)',
        },
        crimson: 'rgb(var(--fe-crimson) / <alpha-value>)',
        rose: 'rgb(var(--fe-rose) / <alpha-value>)',
        // Readable text variants of the accents (theme-aware, AA-compliant).
        goldtext: 'rgb(var(--fe-gold-text) / <alpha-value>)',
        rosetext: 'rgb(var(--fe-rose-text) / <alpha-value>)',
        // Semantic text/border tokens that flip with theme
        ink: 'rgb(var(--fe-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--fe-ink-soft) / <alpha-value>)',
        edge: 'rgb(var(--fe-edge) / <alpha-value>)',
        surface: 'rgb(var(--fe-surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--fe-surface-raised) / <alpha-value>)',
      },
      fontFamily: {
        // Display face carries the regal personality; body stays highly legible.
        display: ['"Cinzel Variable"', '"Cinzel"', 'Georgia', 'serif'],
        body: ['"Spline Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 8px 30px -8px rgb(0 0 0 / 0.45)',
        'gold-glow': '0 0 0 1px rgb(var(--fe-gold) / 0.35), 0 0 22px -4px rgb(var(--fe-gold) / 0.4)',
      },
      borderRadius: {
        panel: '0.625rem',
      },
      keyframes: {
        'heart-pop': {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '55%': { transform: 'scale(1.18)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'x-shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-5px)' },
          '40%,80%': { transform: 'translateX(5px)' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'heart-pop': 'heart-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        'x-shake': 'x-shake 0.4s ease-in-out both',
        'fade-up': 'fade-up 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
