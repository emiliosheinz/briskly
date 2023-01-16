// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env/server.mjs'))

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    // Follows TailwindCSS screens breakpoints
    deviceSizes: [640, 768, 1024, 1280, 1536],
    domains: [`${process.env.AWS_CLOUD_FRONT_URL?.replace('https://', '')}`],
  },
}
export default config
