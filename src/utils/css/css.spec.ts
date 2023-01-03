import { classNames } from './'

describe('CSS Utils', () => {
  describe('classNames', () => {
    it('should join all parameters into a string', () => {
      const result = classNames('param1', 'param2')

      expect(result).toBe('param1 param2')
    })

    it('should filter out falsy string', () => {
      const result = classNames('param1', '', 'param3')

      expect(result).toBe('param1 param3')
    })
  })
})
