import { validateArr, validateObject } from './validation'

describe('test validation functions', () => {
  it('test validateArr', () => {
    const obj = [1, 2, 3, 4, 5]
    const validKeys = [1, 2, 3, 4]
    const res = validateArr(obj, validKeys)
    expect(res).toEqual([1, 2, 3, 4])
  })

  it('test validateObject', () => {
    const obj = { a: 1, b: '2', c: '3' }
    const vKey = (k: string) => k === 'a' || k === 'b'
    const vEntry = (o: unknown) => typeof o === 'number'
    const res = validateObject(obj, vKey, vEntry)
    expect(res).toEqual({ a: 1 })
  })
})
