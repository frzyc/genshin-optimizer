import { getObjectKeysRecursive, objMultiplication, layeredAssignment, objPathValue, crawlObject } from "./Util"

test('objMultiplication', () => {
  const obj = { a: { b: { c: 3 }, d: "e", f: 5 } }
  objMultiplication(obj, 2)
  expect(obj).toEqual({ a: { b: { c: 6 }, d: "e", f: 10 } })
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

test('layeredAssignment', () => {
  const obj = {}
  const keys = ["a", "b", "c", "d"]
  const expected = { a: { b: { c: { d: "test" } } } }
  expect(layeredAssignment(obj, keys, "test")).toEqual(expected)
})

test('objPathValue ', () => {
  const obj = { a: { b: { c: "test" }, b1: {} } }
  expect(objPathValue(obj, ["a", "b", "c"])).toBe("test")
  expect(objPathValue(obj, ["a", "b", "c", "d"])).toBe(undefined)
  expect(objPathValue(obj, ["a", "b1",])).toEqual({})
  expect(objPathValue(obj, ["a", "b1", "c"])).toBe(undefined)
})
test('crawlObject', () => {
  const obj = { a: { b: { c: "Test", c1: false }, b1: null }, a1: {} }
  crawlObject(obj, [], t => t === "Test", (o, keys) => {
    expect(o).toBe("Test")
    expect(keys).toEqual(["a", "b", "c"])
  })
})