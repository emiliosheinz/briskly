/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  singleQuote: true,
  endOfLine: 'lf',
  printWidth: 80,
  semi: false,
  tabWidth: 2,
}
