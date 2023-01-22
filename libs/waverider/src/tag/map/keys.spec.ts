import { compileTagMapKeys } from './compilation'
import { TagMapKeys } from './keys'

describe('compileTagMapKeys', () => {
  it('can encode 32 bits in one word', () => {
    const keys = compileTagMapKeys([...Array(8)].map((_, i) =>
      ({ category: `cat${i}`, values: [...Array(15)].map((_, i) => `val${i}`) })
    ))
    // Each of the eights categories requires 4 bit, resulting in exactly 32-bit requirement
    expect(keys.tagLen).toEqual(1)
  })
  describe('can encode multiple words', () => {
    test('automatically', () => {
      const keys = compileTagMapKeys([...[...Array(7)].map((_, i) =>
        ({ category: `cat${i}`, values: [...Array(8)].map((_, i) => `val${i}`) })
      ), ({ category: `cat8`, values: [...Array(16)].map((_, i) => `val${i}`) })
      ])
      // Each of the first seven categories requires 4 bit, and the last category requires 5 bits
      expect(keys.tagLen).toEqual(2)
    })
    test('explicitly', () => {
      const keys = compileTagMapKeys([
        ({ category: 'cat1', values: [...Array(8)].map((_, i) => `val${i}`) }),
        undefined, // Jump to next byte
        ({ category: 'cat2', values: [...Array(16)].map((_, i) => `val${i}`) }),
      ])
      // Each of the first seven categories requires 4 bit, and the last category requires 5 bits
      expect(keys.tagLen).toEqual(2)
    })
  })
  it('can support full tag list', () => {
    const compiled = compileTagMapKeys([
      { category: 'cat1', values: [...new Array(15)].map((_, i) => `val${i}`) },
      { category: 'cat2', values: [...new Array(15)].map((_, i) => `val${i}`) },
    ]), keys = new TagMapKeys(compiled)

    // Each category occupies exactly four bits and can each support up to fifteen entries, meaning that
    // all entries use every possible bit patterns. If the allocated bits of both categories overlap, we
    // should see some weird behaviour.

    const list = new Set<number>()
    for (let i = 0; i < 15; i++)
      for (let j = 0; j < 15; j++)
        list.add(keys.get({ cat1: `val${i}`, cat2: `val${j}` })[0]!)

    expect(list.size).toEqual(15 * 15)
    expect(Math.max(...list)).toBeLessThanOrEqual(16 * 16)
  })
})
