import { routes } from '../navigation'
import { getBaseUrl, getNextAuthUrl, isServerSide } from './'

const makeWindowUndefined = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete global.window
}

describe('Runtime Utils', () => {
  const { window } = global
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })

  afterEach(() => {
    global.window = window
    process.env = env
  })

  describe('isServerSide', () => {
    it('should be true when window is undefined', () => {
      makeWindowUndefined()

      const result = isServerSide()

      expect(result).toEqual(true)
    })

    it('should be false when window is defined', () => {
      const result = isServerSide()

      expect(result).toEqual(false)
    })
  })

  describe('getBaseUrl', () => {
    it('should return current window.location.href when client side', () => {
      const result = getBaseUrl()

      expect(result).toBe('http://localhost')
    })

    it('should use process.env.VERCEL_URL when defined and is server side', () => {
      makeWindowUndefined()

      const mockedHost = 'mocked.host'
      process.env.VERCEL_URL = mockedHost

      const result = getBaseUrl()

      expect(result).toBe(`https://${mockedHost}`)
    })

    it('should use localhost when server side and no process.env.VERCEL_URL is defined', () => {
      makeWindowUndefined()

      const result = getBaseUrl()

      expect(result).toBe(`http://localhost:3000`)
    })

    it('should use localhost and custom port when server side, no process.env.VERCEL_URL is defined but process.env.PORT is defined', () => {
      const mockedPort = '5000'
      makeWindowUndefined()
      process.env.PORT = mockedPort

      const result = getBaseUrl()

      expect(result).toBe(`http://localhost:${mockedPort}`)
    })
  })

  describe('getNextAuthUrl', () => {
    it('should return signIn route when server side and no path is provided', () => {
      makeWindowUndefined()

      const result = getNextAuthUrl()

      expect(result).toBe(routes.signIn())
    })

    it('should return signIn route with callbackUrl when server side and a path is provided', () => {
      makeWindowUndefined()

      const path = '/mock/path'
      const result = getNextAuthUrl({ path })

      const url = routes.signIn({ callbackUrl: `${getBaseUrl()}${path}` })

      expect(result).toBe(url)
    })

    it('should use window.location.pathname as fallback when client side and no path is provided', () => {
      const path = '/mock/path'

      Object.defineProperty(window, 'location', {
        value: {
          pathname: path,
        },
      })

      const result = getNextAuthUrl()
      const url = routes.signIn({ callbackUrl: `${getBaseUrl()}${path}` })

      expect(result).toBe(url)
    })

    it('should return signIn route with callbackUrl when client side and path is provided', () => {
      const path = '/mock/path/2'

      const result = getNextAuthUrl({ path })
      const url = routes.signIn({ callbackUrl: `${getBaseUrl()}${path}` })

      expect(result).toBe(url)
    })
  })
})
