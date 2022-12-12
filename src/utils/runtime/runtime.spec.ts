import { isServerSide } from '~/utils/runtime'

const makeWindowUndefined = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete global.window
}

describe('Runtime Utils', () => {
  describe('isServerSide', () => {
    const { window } = global

    afterEach(() => {
      global.window = window
    })

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
})
