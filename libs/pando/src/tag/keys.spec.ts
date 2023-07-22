import { compileTagMapKeys } from './compilation'
import { TagMapKeys } from './keys'

function tagList(category: string, n: number) {
  return { category, values: new Set([...Array(n)].map((_, i) => `val${i}`)) }
}

describe('TagMapKeys', () => {
  describe('compileTagMapKeys', () => {
    it('can encode 32 bits in one word', () => {
      const keys = compileTagMapKeys(
        [...Array(8)].map((_, i) => tagList(`cat${i}`, 15))
      )
      // Each of the eights categories requires 4 bit, requiring exactly 32-bit in total
      expect(keys.tagLen).toEqual(1)
    })
    describe('can encode multiple words', () => {
      test('automatically', () => {
        const keys = compileTagMapKeys([
          ...[...Array(7)].map((_, i) => tagList(`cat${i}`, 8)),
          tagList('cat8', 16),
        ])
        // Each of the first seven categories requires 4 bit, and the last category requires 5 bits
        expect(keys.tagLen).toEqual(2)
      })
      test('explicitly', () => {
        const keys = compileTagMapKeys([
          tagList('cat1', 8),
          undefined, // Jump to the next byte
          tagList('cat2', 16),
        ])
        expect(keys.tagLen).toEqual(2)
      })
    })
    it('can support full tag list', () => {
      const compiled = compileTagMapKeys([
          tagList('cat1', 15),
          tagList('cat2', 15),
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
        tagList('cat1', 4),
        tagList('cat2', 4),
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
