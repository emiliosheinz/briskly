import { routes } from '../navigation'

export function isServerSide() {
  return typeof window === 'undefined'
}

export const getBaseUrl = () => {
  if (!isServerSide()) return window.location.origin // browser should use current location
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export function getNextAuthUrl(params?: { path: string }) {
  const { path } = params ?? {}
  const baseUrl = getBaseUrl()

  const fallbackPath = isServerSide() ? path : path || window.location.pathname
  const callbackUrl = fallbackPath ? `${baseUrl}${fallbackPath}` : ''

  return routes.signIn({ callbackUrl })
}
