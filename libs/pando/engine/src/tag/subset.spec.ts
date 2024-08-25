import { TagMapKeys, TagMapSubset } from './'
import type {
  RawTagMapKeys,
  RawTagMapValues,
  TagMapEntries,
} from './compilation'
import { compileTagMapKeys, compileTagMapValues } from './compilation'

function tagList(category: string, n: number) {
  return { category, values: new Set([...Array(n)].map((_, i) => `val${i}`)) }
}

describe('TagMapValues', () => {
  it('can process simple queries', () => {
    const { keys, values } = compileTagMapEntries([
        { value: 1, tag: { cat1: 'val1', cat2: 'val1' } },
        { value: 2, tag: { cat1: 'val2', cat2: 'val1' } },
        { value: 3, tag: { cat1: 'val3', cat2: 'val1' } },
        { value: 4, tag: { cat1: 'val1', cat2: 'val2' } },
        { value: 5, tag: { cat1: 'val2', cat2: 'val2' } },
        { value: 6, tag: { cat1: 'val3', cat2: 'val2' } },
      ]),
      map = new TagMapSubset(keys, values)

    expect(map.subset({}).sort()).toEqual([])
    expect(map.subset({ cat1: 'val1' }).sort()).toEqual([])
    expect(map.subset({ cat2: 'val2' }).sort()).toEqual([])
    expect(map.subset({ cat1: 'val1', cat2: 'val2' }).sort()).toEqual([4])
  })
  it('can combine duplicate entries', () => {
    const { keys, values } = compileTagMapEntries([
        { value: 1, tag: { cat1: 'val1' } },
        { value: 2, tag: { cat1: 'val1' } },
      ]),
      map = new TagMapSubset(keys, values)

    expect(map.subset({ cat1: 'val1' }).sort()).toEqual([1, 2])
  })
  it('can support multiple-word lookup', () => {
    const keys = compileTagMapKeys([
      tagList('cat1', 8),
      undefined,
      tagList('cat2', 16),
    ])
    const values = compileTagMapValues(keys, [
        { value: 1, tag: { cat1: 'val0' } },
        { value: 2, tag: { cat1: 'val1', cat2: 'val0' } },
      ]),
      map = new TagMapSubset(keys, values)

    expect(map.subset({ cat1: 'val0', cat2: 'val3' })).toEqual([1])
    expect(map.subset({ cat1: 'val1', cat2: 'val3' })).toEqual([])
    expect(map.subset({ cat1: 'val1', cat2: 'val0' })).toEqual([2])
  })
})

function compileTagMapEntries<V>(entries: TagMapEntries<V>): {
  keys: RawTagMapKeys
  values: RawTagMapValues<V>
} {
  const tags = new Map<string, Set<string>>()
  for (const { tag } of entries) {
    for (const [cat, val] of Object.entries(tag)) {
      if (val === null) continue
      if (!tags.has(cat)) tags.set(cat, new Set())
      tags.get(cat)!.add(val)
    }
  }
  const keys = compileTagMapKeys(
    [...tags].map(([category, val]) => ({
      category,
      values: new Set([...val]),
    }))
  )
  const values = compileTagMapValues(new TagMapKeys(keys), entries)
  return { keys, values }
}
