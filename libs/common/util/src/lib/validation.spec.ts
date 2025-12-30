import { validateArr } from './validation'

describe('test validation functions', () => {
  it('test validateArr', () => {
    const obj = [1, 2, 3, 4, 5]
    const validKeys = [1, 2, 3, 4]
    const res = validateArr(obj, validKeys)
    expect(res).toEqual([1, 2, 3, 4])
  })
})
