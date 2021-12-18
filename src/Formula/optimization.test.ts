import { constant } from "./internal"
import { optimize } from "./optimization"
import { makeReaders, max, min, prod, sum } from "./utils"

const cInner = { a: "unique", b: "unique", c: "unique" } as const
const context = { a: cInner, b: cInner, c: cInner } as const
const cReaders = makeReaders(context)

describe("optimization", () => {
  test("flatten same formula", () => {
    const r1 = cReaders.a.a, r2 = cReaders.a.b, r3 = cReaders.a.c
    const r4 = cReaders.b.a, r5 = cReaders.b.b, r6 = cReaders.b.c

    const f1 = sum(r1, r2, sum(r3, r4), r5, r6)
    expect(optimize([f1])).toEqual([sum(r1, r2, r3, r4, r5, r6)])

    // Don't flatten commonly-used terms
    const f2 = sum(r3, r4)
    // TODO: Factoring process may reorder the term ( r3 + r4 ). May need to update the checking
    expect(optimize([f1, f2])).toEqual([sum(r1, r2, r5, r6, sum(r3, r4)), sum(r3, r4)])
  })
  test("flatten multple nested formula", () => {
    const r1 = cReaders.a.a, r2 = cReaders.a.b, r3 = cReaders.a.c
    const r4 = cReaders.b.a, r5 = cReaders.b.b, r6 = cReaders.b.c

    const f = sum(r1, sum(r2, sum(r3, sum(r4, sum(r5, r6)))))
    expect(optimize([f])).toEqual([sum(r1, r2, r3, r4, r5, r6)])
  })
  test("factor common terms", () => {
    const r1 = cReaders.a.a, r2 = cReaders.a.b, r3 = cReaders.a.c
    const r4 = cReaders.b.a, r5 = cReaders.b.b, r6 = cReaders.b.c

    const f1 = sum(r1, r2, r3, r4, r5, r6), f2 = sum(r3, r4)
    // TODO: Factoring process may reorder the term ( r3 + r4 ). May need to update the checking
    expect(optimize([f1, f2])).toEqual([sum(r1, r2, r5, r6, sum(r3, r4)), sum(r3, r4)])
  })
  test("remove unnecessary constants", () => {
    const r1 = cReaders.a.a, r2 = cReaders.a.b, r3 = cReaders.c.a

    expect(optimize([sum(1, -1, r1, r2, r3)])).toEqual([sum(r1, r2, r3)])
    expect(optimize([prod(1, r1, r2, r3)])).toEqual([prod(r1, r2, r3)])
    expect(optimize([min(Infinity, r1, r2, r3)])).toEqual([min(r1, r2, r3)])
    expect(optimize([max(-Infinity, r1, r2, r3)])).toEqual([max(r1, r2, r3)])

    // Degenerate case
    expect(optimize([prod(0, r1, r2, r3)])).toEqual([constant(0)])

    // Remove wrapper for single-value formula
    expect(optimize([sum(1, -1, r1)])).toEqual([r1])
  })
})
