import { compileTagMapKeys } from './compilation'
import { TagMapKeys } from './keys'

describe('TagMapKeys', () => {
  describe('compileTagMapKeys', () => {
    it('can encode 32 bits in one word', () => {
      const keys = compileTagMapKeys(
        [...Array(8)].map((_, i) => ({
          category: `cat${i}`,
          values: [...Array(15)].map((_, i) => `val${i}`),
        }))
      )
      // Each of the eights categories requires 4 bit, requiring exactly 32-bit in total
      expect(keys.tagLen).toEqual(1)
    })
    describe('can encode multiple words', () => {
      test('automatically', () => {
        const keys = compileTagMapKeys([
          ...[...Array(7)].map((_, i) => ({
            category: `cat${i}`,
            values: [...Array(8)].map((_, i) => `val${i}`),
          })),
          { category: `cat8`, values: [...Array(16)].map((_, i) => `val${i}`) },
        ])
        // Each of the first seven categories requires 4 bit, and the last category requires 5 bits
        expect(keys.tagLen).toEqual(2)
      })
      test('explicitly', () => {
        const keys = compileTagMapKeys([
          { category: 'cat1', values: [...Array(8)].map((_, i) => `val${i}`) },
          undefined, // Jump to the next byte
          { category: 'cat2', values: [...Array(16)].map((_, i) => `val${i}`) },
        ])
        expect(keys.tagLen).toEqual(2)
      })
    })
    it('can support full tag list', () => {
      const compiled = compileTagMapKeys([
          {
            category: 'cat1',
            values: [...new Array(15)].map((_, i) => `val${i}`),
          },
          {
            category: 'cat2',
            values: [...new Array(15)].map((_, i) => `val${i}`),
          },
        ]),
        keys = new TagMapKeys(compiled)

      // Each category occupies exactly four bits and supports up to fifteen entries, meaning that all
      // entries use every possible bit patterns. If the allocation of both categories overlap, we would
      // see some weird behaviours.

      const list = new Set<number>([keys.get({})[0]!])
      for (let i = 0; i < 15; i++)
        for (let j = 0; j < 15; j++)
          list.add(keys.get({ cat1: `val${i}`, cat2: `val${j}` })[0]!)
      for (let i = 0; i < 15; i++) {
        list.add(keys.get({ cat1: `val${i}` })[0]!)
        list.add(keys.get({ cat2: `val${i}` })[0]!)
      }

      expect(list.size).toEqual(16 * 16)
      expect(Math.max(...list)).toBeLessThanOrEqual(16 * 16)
    })
  })

  describe('combine', () => {
    const compiled = compileTagMapKeys([
        { category: 'cat1', values: ['val1', 'val2', 'val3'] },
        { category: 'cat2', values: ['val1', 'val2', 'val3'] },
      ]),
      keys = new TagMapKeys(compiled)
    it('can combine simple tags', () => {
      const id1 = keys.get({ cat1: 'val1', cat2: 'val2' })
      const id2 = keys.combine(id1, { cat1: 'val3' }).id
      const id3 = keys.get({ cat1: 'val3', cat2: 'val2' })

      expect(id1).not.toEqual(id3)
      expect(id2).toEqual(id3)
    })
    it('erases the tag when combining with `null`', () => {
      const id1 = keys.get({ cat1: 'val1', cat2: 'val2' })
      const id2 = keys.combine(id1, { cat1: null }).id
      const id3 = keys.get({ cat2: 'val2' })

      expect(id1).not.toEqual(id3)
      expect(id2).toEqual(id3)
    })
  })
})
