import {
  artSetPieces,
  buildPando,
  buildWrSolo,
  hitModeToCritMode,
  mapWrEnerRech,
  mapWrFinal,
  type ParityFixture,
  readPandoArtSet,
  readWrArtSet,
} from './harness'
import { relDiff } from './relDiff'

const NOELLE_BASE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Noelle',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusGreatsword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Noelle',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('parity helpers', () => {
  test('relDiff is symmetric and zero on equal', () => {
    expect(relDiff(10, 10)).toBe(0)
    expect(relDiff(10, 11)).toBeCloseTo(relDiff(11, 10))
    expect(relDiff(100, 101)).toBeLessThan(0.02)
  })

  test('mapWrEnerRech drops WR base 1', () => {
    expect(mapWrEnerRech(1.2)).toBeCloseTo(0.2)
    expect(mapWrFinal('enerRech_', 1)).toBeCloseTo(0)
    expect(mapWrFinal('atk', 100)).toBe(100)
  })

  test('hitModeToCritMode', () => {
    expect(hitModeToCritMode('avgHit')).toBe('avg')
    expect(hitModeToCritMode('hit')).toBe('nonCrit')
    expect(hitModeToCritMode('critHit')).toBe('crit')
  })
})

describe('WR art wiring', () => {
  test('0pc / 2pc / 4pc set counts match on both engines', () => {
    for (const n of [0, 2, 4] as const) {
      const member = NOELLE_BASE.members[0]
      if (!member) throw new Error('missing member')
      const fixture: ParityFixture = {
        ...NOELLE_BASE,
        members: [
          {
            ...member,
            arts: artSetPieces('GladiatorsFinale', n),
          },
        ],
      }
      const wr = buildWrSolo(fixture)
      const pando = buildPando(fixture)
      expect(readWrArtSet(wr, 'GladiatorsFinale'), `WR count n=${n}`).toBe(n)
      expect(
        readPandoArtSet(pando, 'GladiatorsFinale'),
        `Pando count n=${n}`
      ).toBe(n)
    }
  })
})
