import type { Config } from 'tailwindcss';

/**
 * The design tokens below are the exact values from the original
 * `:root { --cream: … }` block of the single-file build. They are exposed to
 * Tailwind so that utility classes (`bg-cream`, `text-maroon`, `font-optima`,
 * `p-m5`, …) resolve to the same pixels as the hand-written CSS, and the two
 * layers can be mixed freely without any visual drift.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        paper: 'var(--paper)',
        linen: 'var(--linen)',
        maroon: { DEFAULT: 'var(--maroon)', dark: 'var(--maroon-d)' },
        bronze: 'var(--bronze)',
        ink: 'var(--ink)',
        stone: 'var(--stone)',
        quiet: 'var(--quiet)',
        line: { DEFAULT: 'var(--line)', soft: 'var(--line-soft)' },
        pos: 'var(--pos)',
        neg: 'var(--neg)',
      },
      fontFamily: {
        optima: 'var(--optima)',
        garamond: 'var(--garamond)',
      },
      spacing: {
        m1: 'var(--m1)',
        m2: 'var(--m2)',
        m3: 'var(--m3)',
        m4: 'var(--m4)',
        m5: 'var(--m5)',
        m6: 'var(--m6)',
        m7: 'var(--m7)',
        g1: 'var(--g1)',
        g2: 'var(--g2)',
      },
      maxWidth: {
        measure: 'var(--measure)',
      },
    },
  },
  /**
   * Preflight is deliberately OFF.
   *
   * The original build ships its own reset (`* { box-sizing: border-box }`,
   * the `button` normalisation, `img,svg { display:block }` …) and then relies
   * on plain browser defaults for everything it does not restate — most
   * visibly the `list-style: disc` bullets inside `.card ul`. Tailwind's
   * preflight strips those defaults, which would change the rendering. Keeping
   * preflight off means the preserved stylesheet remains the single source of
   * truth for base styling, and Tailwind contributes utilities only.
   */
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

export default config;
