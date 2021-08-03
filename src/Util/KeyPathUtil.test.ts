import { assign, KeyPath, resolve } from "./KeyPathUtil";

describe("KeyPath", () => {
  test("Can create key paths", () => {
    const base = {
      a: {
        b: {
          c: 3
        }
      }
    }
    expect(KeyPath<typeof base>().a()).toEqual(['a'])
    expect(KeyPath<typeof base>().a.b.c()).toEqual(['a', 'b', 'c'])
  })
  test("Can resolve key paths", () => {
    const base = {
      a: {
        b: {
          c: 3
        }
      }
    }
    expect(resolve(base, KeyPath<typeof base>().a.b())).toEqual({ c: 3 })
    expect(resolve(base, KeyPath<typeof base>().a.b.c())).toEqual(3)
  })
  test("Can assign key paths", () => {
    const base = {
      a: {
        b: {
          c: 3
        }
      }
    }
    assign(base, KeyPath<typeof base>().a.b(), "test" as any)
    expect(base).toEqual({ a: { b: "test" } })
    assign(base, ['x', 'y', 'z'], 5)
    expect((base as any).x.y.z).toEqual(5)
  })
  test("Returns `undefined` on failed paths", () => {
    const base = { x: null }
    expect(resolve(base, ['a', 'b', 'c'])).toBeUndefined()
    expect(resolve(base, ['x', 'b', 'c'])).toBeUndefined()
  })
})
