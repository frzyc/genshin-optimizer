import { TagMap } from '.'
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
    ]), map = new TagMap(keys, values)

    expect(map.subset({}).sort()).toEqual([])
    expect(map.subset({ cat1: 'val1' }).sort()).toEqual([])
    expect(map.refExact({ cat1: 'val1' }).sort()).toEqual([])
    expect(map.subset({ cat2: 'val2' }).sort()).toEqual([])
    expect(map.refExact({ cat2: 'val2' }).sort()).toEqual([])
    expect(map.subset({ cat1: 'val1', cat2: 'val2' }).sort()).toEqual([4])
    expect(map.refExact({ cat1: 'val1', cat2: 'val2' }).sort()).toEqual([4])
  })
  it('can combine duplicate entries', () => {
    const { keys, values } = compileTagMapEntries([
      { value: 1, tag: { cat1: 'val1' } },
      { value: 2, tag: { cat1: 'val1' } },
    ]), map = new TagMap(keys, values)

    expect(map.subset({ cat1: 'val1' }).sort()).toEqual([1, 2])
    expect(map.refExact({ cat1: 'val1' }).sort()).toEqual([1, 2])
  })
  it('can distinguish exact queries from subset queries', () => {
    const { keys, values } = compileTagMapEntries([
      { value: 1, tag: { cat1: 'val1' } },
      { value: 2, tag: { cat1: 'val1', cat2: 'val2' } },
    ]), map = new TagMap(keys, values)

    expect(map.subset({ cat1: 'val1', cat2: 'val2' }).sort()).toEqual([1, 2])
    expect(map.refExact({ cat1: 'val1', cat2: 'val2' }).sort()).toEqual([2])
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
    ]), map = new TagMap(keys, values)

    expect(map.subset({ cat1: 'val0', cat2: 'val3' })).toEqual([1])
    expect(map.subset({ cat1: 'val1', cat2: 'val3' })).toEqual([])
    expect(map.subset({ cat1: 'val1', cat2: 'val0' })).toEqual([2])
  })
})
