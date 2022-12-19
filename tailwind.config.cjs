/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    colors: {
      primary: {
        900: '#0F172A',
        400: '#94A3B8',
        50: '#F8FAFC',
      },
      error: {
        700: '#B91C1C',
        300: '#FCA5A5',
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
  plugins: [],
}
