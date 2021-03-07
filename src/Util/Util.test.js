import { getObjectKeysRecursive, objMultiplication } from "./Util"

describe('objMultiplication()', () => {
  test('should multiply', () => {
    const obj = { a: { b: { c: 3 }, d: "e", f: 5 } }
    objMultiplication(obj, 2)
    expect(obj).toEqual({ a: { b: { c: 6 }, d: "e", f: 10 } })
  })
})

describe('getObjectKeysRecursive', () => {
  test('should get keys', () => {
    const obj = { a: { b: { c: 3 }, d: "e" } }
    expect(getObjectKeysRecursive(obj).sort()).toEqual(["a", "b", "c", "d", "e"].sort())
  })
  test('should handle string', () => {
    expect(getObjectKeysRecursive("test").sort()).toEqual(["test"].sort())
  })
})
