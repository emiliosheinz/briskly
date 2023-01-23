/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    colors: {
      primary: {
        900: '#0F172A',
        800: '#1E293B',
        400: '#94A3B8',
        500: '#64748b',
        200: '#E2E8F0',
        100: '#F1F5F9',
        50: '#FFFFFF',
      },
      black: {
        900: '#000000',
      },
      error: {
        700: '#B91C1C',
        500: '#ef4444',
        300: '#FCA5A5',
        50: '#fef2f2',
      },
      success: {
        700: '#15803D',
        300: '#86EFAC',
      },
      warning: {
        500: '#EAB308',
        200: '#FEF08A',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
