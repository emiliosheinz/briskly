import { toBase64 } from '.'

const makeWindowUndefined = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete global.window
}
const ORIGINAL_STRING = 'placeholder'
const BASE_64_STRING = 'cGxhY2Vob2xkZXI='

describe('Runtime Conversion', () => {
  describe('toBase64', () => {
    const { window } = global

    afterEach(() => {
      global.window = window
    })

    it('should converte the string to base64 on server side', () => {
      makeWindowUndefined()

      const result = toBase64(ORIGINAL_STRING)

      expect(result).toEqual(BASE_64_STRING)
    })

    it('should converte the string to base64 on client side', () => {
      const result = toBase64(ORIGINAL_STRING)

      expect(result).toEqual(BASE_64_STRING)
    })
  })
})
