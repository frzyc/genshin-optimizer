import type { Tag } from './index'
import { rootQuery } from './index'

describe('', () => {
  test('', () => {
    const root = rootQuery()
    const parent = root.child({ a: '1', c: false })
    const child = parent.child({ b: 2 })

    expect(child.all_used()).toEqual(['b'])
    expect(child.get('a')).toEqual('1')
    expect(child.all_used().sort()).toEqual(['a', 'b'])
    expect(parent.all_used().sort()).toEqual(['a', 'c'])
    expect(root.all_used()).toEqual([])
  })
})

type DollarObject = {
  eq(other: DollarObject | string | number | boolean): boolean
  ne(other: DollarObject | string | number | boolean): boolean

  ge(other: DollarObject | number): boolean
  gt(other: DollarObject | number): boolean
  le(other: DollarObject | number): boolean
  lt(other: DollarObject | number): boolean

  add(expr: symbol): void
}
type Dollar = {
  [k: symbol]: DollarObject
} & {
  with(
    tag: Tag,
    all: (keyof Tag)[],
    any: (keyof Tag)[],
    _: ($: Dollar) => void
  ): Dollar
}

function ttt($: Dollar) {
  if ($[Symbol()].eq(3)) {
    $[Symbol()].add(Symbol())
  }
}
