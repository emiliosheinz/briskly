import { faker } from '@faker-js/faker'

import { routes } from './'

describe('Navigation Utils', () => {
  describe('Routes SignIn', () => {
    const basePath = '/api/auth/signin'

    it('should return only the base path when no callbackUrl is provided', () => {
      const result = routes.signIn()

      expect(result).toBe(basePath)
    })

    it('should return only the base with the callbackUrl', () => {
      const callbackUrl = faker.internet.url()
      const result = routes.signIn({ callbackUrl })

      const basePathWithCallbackUrl = `${basePath}?callbackUrl=${callbackUrl}`

      expect(decodeURIComponent(result)).toBe(basePathWithCallbackUrl)
    })
  })
})
