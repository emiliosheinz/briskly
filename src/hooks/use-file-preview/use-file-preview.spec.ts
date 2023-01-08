import { faker } from '@faker-js/faker'
import { act, renderHook } from '@testing-library/react'

import { useFilePreview } from './use-file-preview.hook'

const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

afterEach(() => {
  jest.clearAllMocks()
})

describe('useFilePreview Hook', () => {
  it('should return an empty string when falsy file is provided', () => {
    const { result } = renderHook(() => useFilePreview())

    expect(result.current).toBe('')
  })

  it('should return the preview based on URL.createObjectURL result', () => {
    const expectedResult = 'EXPECTED_RESULT'
    const fileContent = faker.random.words(10).split(' ')
    const fileName = faker.random.word()
    const file = new File(fileContent, fileName)

    mockCreateObjectURL.mockReturnValue(expectedResult)

    const { result } = renderHook(() => useFilePreview(file))

    expect(mockCreateObjectURL).toHaveBeenCalledWith(file)
    expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    expect(result.current).toBe(expectedResult)
  })

  it('should call URL.revokeObjectURL with URL.createObjectURL result on unmount', () => {
    const expectedResult = 'EXPECTED_RESULT'
    const fileContent = faker.random.words(10).split(' ')
    const fileName = faker.random.word()
    const file = new File(fileContent, fileName)

    mockCreateObjectURL.mockReturnValue(expectedResult)

    const { result, unmount } = renderHook(() => useFilePreview(file))

    act(() => {
      unmount()
    })

    expect(mockCreateObjectURL).toHaveBeenCalledWith(file)
    expect(mockRevokeObjectURL).toHaveBeenCalledWith(expectedResult)
    expect(result.current).toBe(expectedResult)
  })
})
