import { TagMap } from '.'
import { compileTagMapEntries } from './compilation'

describe('TabMapSubsetCache', () => {
  const { keys, values } = compileTagMapEntries([
    { value: 1, tag: { cat1: 'val1', cat2: 'val1' } },
    { value: 2, tag: { cat1: 'val1', cat2: 'val2' } },
    { value: 3, tag: { cat1: 'val2', cat2: 'val2' } },
    { value: 4, tag: { cat1: 'val2' } },
  ]), map = new TagMap(keys, values)

  it('can cache old tags', () => {
    let cache = map.cacheSubset()

    expect(cache.subset()).toEqual([])
    cache = cache.with({ cat1: 'val1', cat2: 'val2' })
    expect(cache.subset()).toEqual([2])
    cache = cache.with({ cat2: 'val1' }) // Change only cat2
    expect(cache.subset()).toEqual([1])
    cache = cache.with({ cat2: 'val2' }) // Change back
    expect(cache.subset()).toEqual([2])
  })
  it('can override using `null` tags', () => {
    let cache = map.cacheSubset()

    expect(cache.subset()).toEqual([])
    cache = cache.with({ cat1: 'val1', cat2: 'val2' })
    expect(cache.subset()).toEqual([2])
    cache = cache.with({ cat1: 'val2', cat2: null }) // Erase cat2
    expect(cache.subset()).toEqual([4])
    cache = cache.with({ cat2: 'val2' })
    expect(cache.subset().sort()).toEqual([3, 4])
  })
})
