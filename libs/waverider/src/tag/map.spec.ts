import { tagMapFromEntries } from './keyCompilation'

describe('TagMap', () => {
  describe('can process simple', () => {
    const map = tagMapFromEntries([
      { value: 1, tag: { 'cat1': 'val1', 'cat2': 'val1' } },
      { value: 2, tag: { 'cat1': 'val2', 'cat2': 'val1' } },
      { value: 3, tag: { 'cat1': 'val3', 'cat2': 'val1' } },
      { value: 4, tag: { 'cat1': 'val1', 'cat2': 'val2' } },
      { value: 5, tag: { 'cat1': 'val2', 'cat2': 'val2' } },
      { value: 6, tag: { 'cat1': 'val3', 'cat2': 'val2' } },
    ])

    test('exact queries', () => {
      expect(map.exact({})).toEqual([])
      expect(map.exact({ 'cat1': 'val3', 'cat2': 'val2' }).sort()).toEqual([6])
    })
    test('superset queries', () => {
      expect(map.superset({}).sort()).toEqual([1, 2, 3, 4, 5, 6])
      expect(map.superset({ 'cat2': 'val1' }).sort()).toEqual([1, 2, 3])
    })
    test('subset queries', () => {
      expect(map.subset({}).sort()).toEqual([])
      expect(map.subset({ 'cat1': 'val1', 'cat2': 'val2' }).sort()).toEqual([4])
    })
  })
  it('can combine duplicated entries', () => {
    const map = tagMapFromEntries([
      { value: 1, tag: { 'cat1': 'val1' } },
      { value: 2, tag: { 'cat1': 'val1' } },
    ])

    expect(map.exact({ 'cat1': 'val1' }).sort()).toEqual([1, 2])
    expect(map.superset({}).sort()).toEqual([1, 2])
  })

  const tag = (v: number, numCat: number) => Object.fromEntries([...Array(numCat)].map((_, i) => ['cat' + i, 'val' + v]))

  it('can support 32 bit in one word', () => {
    // Each of the eights categories requires 4 bit, resulting in exactly 32-bit requirement
    const map = tagMapFromEntries([...Array(6)].map((_, i) => ({ value: i, tag: tag(i, 8) })))
    expect(map.keys.tagLen).toEqual(1)
    expect(map.exact(tag(0, 8))).toEqual([0])
    expect(map.exact(tag(1, 8))).toEqual([1])
    expect(map.exact(tag(2, 8))).toEqual([2])
    expect(map.exact(tag(3, 8))).toEqual([3])
    expect(map.exact(tag(4, 8))).toEqual([4])
    expect(map.exact(tag(5, 8))).toEqual([5])

    expect(map.superset({}).sort()).toEqual([0, 1, 2, 3, 4, 5])
  })
  it('can support multiple words', () => {
    // Add one entry to `cat7:` so that the keys needs exactly 33 bits
    const map = tagMapFromEntries([
      ...[...Array(6)].map((_, i) => ({ value: i, tag: tag(i, 8) })),
      { value: -1, tag: { 'cat7': 'unknown' } },
    ])
    expect(map.keys.tagLen).toEqual(2)
    expect(map.exact(tag(0, 8))).toEqual([0])
    expect(map.exact(tag(1, 8))).toEqual([1])
    expect(map.exact(tag(2, 8))).toEqual([2])
    expect(map.exact(tag(3, 8))).toEqual([3])
    expect(map.exact(tag(4, 8))).toEqual([4])
    expect(map.exact(tag(5, 8))).toEqual([5])

    expect(map.superset({}).sort()).toEqual([-1, 0, 1, 2, 3, 4, 5])
  })
  it('can support full tag list', () => {
    const tag = (i1: number, i2: number) => ({ cat1: `${i1}`, cat2: `${i2}` })
    const entries = [...Array(36)].map((_, i) => ({ value: i, tag: tag(Math.floor(i / 6), i % 6) }))
    const map = tagMapFromEntries(entries)

    // There are six tag values for each of the two categories. Each tag occupies exactly four bits
    // and can each support up to six entries. Meaning that all 36 entries use every possible 3 + 3
    // bit patterns. If the allocated bits of both categories overlap, then we should see some weird
    // behaviour.
    for (const { tag, value } of entries)
      expect(map.exact(tag)).toEqual([value])
  })
})
