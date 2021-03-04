import { objMultiplication } from "./Util"

describe('objMultiplication()', () => {
  test('should multiply', () => {
    const obj = { a: { b: { c: 3 }, d: "e", f: 5 } }
    objMultiplication(obj, 2)
    expect(obj).toEqual({ a: { b: { c: 6 }, d: "e", f: 10 } })
  })
})
