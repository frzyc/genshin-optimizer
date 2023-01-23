import { TagMapSubset } from './'
import { compileTagMapEntries, compileTagMapKeys, compileTagMapValues } from './compilation'

describe('TagMapValues', () => {
  it('can process simple queries', () => {
    const { keys, values } = compileTagMapEntries([
      { value: 1, tag: { cat1: 'val1', cat2: 'val1' } },
      { value: 2, tag: { cat1: 'val2', cat2: 'val1' } },
      { value: 3, tag: { cat1: 'val3', cat2: 'val1' } },
      { value: 4, tag: { cat1: 'val1', cat2: 'val2' } },
      { value: 5, tag: { cat1: 'val2', cat2: 'val2' } },
      { value: 6, tag: { cat1: 'val3', cat2: 'val2' } },
    ]), map = new TagMapSubset(keys, values)

    expect(map.subset({}).sort()).toEqual([])
    expect(map.subset({ cat1: 'val1' }).sort()).toEqual([])
    expect(map.subset({ cat2: 'val2' }).sort()).toEqual([])
    expect(map.subset({ cat1: 'val1', cat2: 'val2' }).sort()).toEqual([4])
  })
  it('can combine duplicate entries', () => {
    const { keys, values } = compileTagMapEntries([
      { value: 1, tag: { cat1: 'val1' } },
      { value: 2, tag: { cat1: 'val1' } },
    ]), map = new TagMapSubset(keys, values)

    expect(map.subset({ cat1: 'val1' }).sort()).toEqual([1, 2])
  })
  it('can support multiple-word lookup', () => {
    const keys = compileTagMapKeys([
      ({ category: `cat1`, values: [...Array(8)].map((_, i) => `val${i}`) }),
      undefined,
      ({ category: `cat2`, values: [...Array(16)].map((_, i) => `val${i}`) }),
    ])
    const values = compileTagMapValues(keys, [
      { value: 1, tag: { cat1: 'val0' } },
      { value: 2, tag: { cat1: 'val1', cat2: 'val0' } },
    ]), map = new TagMapSubset(keys, values)

    expect(map.subset({ cat1: 'val0', cat2: 'val3' })).toEqual([1])
    expect(map.subset({ cat1: 'val1', cat2: 'val3' })).toEqual([])
    expect(map.subset({ cat1: 'val1', cat2: 'val0' })).toEqual([2])
  })

  describe('caching', () => {
    const { keys, values } = compileTagMapEntries([
      { value: 1, tag: { cat1: 'val1', cat2: 'val1' } },
      { value: 2, tag: { cat1: 'val1', cat2: 'val2' } },
      { value: 3, tag: { cat1: 'val2', cat2: 'val2' } },
      { value: 4, tag: { cat1: 'val2' } },
    ]), map = new TagMapSubset(keys, values)

    it('can cache old tags', () => {
      let cache = map.cache()

      expect(cache.subset()).toEqual([])
      cache = cache.with({ cat1: 'val1', cat2: 'val2' })
      expect(cache.subset()).toEqual([2])
      cache = cache.with({ cat2: 'val1' }) // Change only cat2
      expect(cache.subset()).toEqual([1])
      cache = cache.with({ cat2: 'val2' }) // Change back
      expect(cache.subset()).toEqual([2])
    })
    it('can remove categories using `null` tags', () => {
      let cache = map.cache()

      expect(cache.subset()).toEqual([])
      cache = cache.with({ cat1: 'val1', cat2: 'val2' })
      expect(cache.subset()).toEqual([2])
      cache = cache.with({ cat1: 'val2', cat2: null }) // Erase cat2
      expect(cache.subset()).toEqual([4])
      cache = cache.with({ cat2: 'val2' })
      expect(cache.subset().sort()).toEqual([3, 4])
    })
  })
})
