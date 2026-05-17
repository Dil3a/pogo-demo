import type { Config } from 'tailwindcss';

/**
 * POGO design tokens.
 *
 * Brand alignment:
 *  - POGO teal `#00c9b1` is the action color (matches existing UEMF portal POGO module).
 *  - UEMF blue `#003A7A` and green `#1a8a3a` are institutional accents.
 *  - Status colors (available/occupied/charging) match the existing student portal exactly,
 *    so a student moving between modules sees the same visual language.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pogo: {
          DEFAULT: '#00c9b1',
          50: '#e0faf6',
          100: '#ccf5ef',
          400: '#00c9b1',
          500: '#00b09b',
          600: '#00a88f',
        },
        uemf: {
          blue: '#003A7A',
          'blue-dark': '#002a5a',
          green: '#1a8a3a',
          'green-dark': '#1a6e30',
        },
        status: {
          available: '#00c9b1',
          occupied: '#c62828',
          charging: '#e65100',
          maintenance: '#5a6e8c',
        },
        ink: {
          900: '#1a2a4a',
          700: '#3a4a6a',
          500: '#5a6e8c',
          300: '#8fa0b8',
          200: '#d0d9eb',
          100: '#dde4f0',
          50: '#f9fafd',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0, 58, 122, 0.07)',
        'card-hover': '0 4px 14px rgba(0, 58, 122, 0.12)',
        pogo: '0 4px 18px rgba(0, 201, 177, 0.35)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'scan-line': 'scan-line 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(200px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
