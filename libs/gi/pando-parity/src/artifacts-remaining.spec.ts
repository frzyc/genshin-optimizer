/**
 * Remaining combat artifact probes (own RES / incHeal_ / atkSPD_ / listings).
 * Dummy char is Noelle (ported). Empty art stats = set bonus only.
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import {
  type Calculator,
  hexereiTally,
  own,
  withMember,
} from '@genshin-optimizer/gi/formula'
import { input, type NumNode } from '@genshin-optimizer/gi/wr'
import {
  artSetPieces,
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type PandoConditionalSpec,
  type ParityFixture,
  pandoListingNames,
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

const REL_TOL = 1e-4
/** allElementKeys: anemo, geo, electro, hydro, pyro, … → pyro is 1-based index 5. */
const PYRO_LIST_INDEX = 5
/** Song healing states 1000..15000 step 1000 → 5000 is 1-based index 5. */
const SONG_HEAL_5000_INDEX = 5

function withSet(
  set: ArtifactSetKey,
  n: 0 | 2 | 4,
  extra: Partial<ParityFixture> = {}
): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  return {
    ...NOELLE_BASE,
    ...extra,
    members: [{ ...member, arts: artSetPieces(set, n) }],
  }
}

function pandoCond(
  sheet: string,
  name: string,
  value = 1
): PandoConditionalSpec {
  return { sheet, src: '0', dst: null, name, value }
}

function readWrStat(wr: ReturnType<typeof buildWrSolo>, node: NumNode): number {
  return wr.get(node).value as number
}

function readPandoStat(
  calc: Calculator,
  node: Parameters<Calculator['compute']>[0]
): number {
  return calc.compute(node).val as number
}

function expectClose(wrVal: number, pandoVal: number, label: string) {
  expect(Number.isFinite(wrVal), `WR ${label}`).toBe(true)
  expect(Number.isFinite(pandoVal), `Pando ${label}`).toBe(true)
  expect(
    relDiff(wrVal, pandoVal),
    `${label} wr=${wrVal} pando=${pandoVal}`
  ).toBeLessThan(REL_TOL)
}

function checkCounts(set: ArtifactSetKey, n: 0 | 2 | 4) {
  const fixture = withSet(set, n)
  const wr = buildWrSolo(fixture)
  const pando = buildPando(fixture)
  expect(readWrArtSet(wr, set), `WR count n=${n}`).toBe(n)
  expect(readPandoArtSet(pando, set), `Pando count n=${n}`).toBe(n)
  assertFinals(wr, pando)
  assertPandoListingsFinite(pando)
  return { wr, pando }
}

describe('artifacts remaining combat WR ↔ Pando', () => {
  describe('TinyMiracle', () => {
    const set: ArtifactSetKey = 'TinyMiracle'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc all ele RES; 4pc chosen ele', () => {
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      expectClose(
        readWrStat(wr2, input.total.pyro_res_),
        readPandoStat(pando2, own.final.res_.pyro),
        '2pc pyro_res_'
      )
      expect(readWrStat(wr2, input.total.pyro_res_)).toBeCloseTo(0.2)
      expect(readWrStat(wr2, input.total.hydro_res_)).toBeCloseTo(0.2)
      expect(readPandoStat(pando2, own.final.res_.hydro)).toBeCloseTo(0.2)

      const on = withSet(set, 4, {
        wrConditionals: { TinyMiracle: { element: 'pyro' } },
        pandoConditionals: [pandoCond(set, 'element', PYRO_LIST_INDEX)],
      })
      const wrOn = buildWrSolo(on)
      const pandoOn = buildPando(on)
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOn, input.total.pyro_res_),
        readPandoStat(pandoOn, own.final.res_.pyro),
        '4pc pyro_res_'
      )
      expect(readWrStat(wrOn, input.total.pyro_res_)).toBeCloseTo(0.5)
      expect(readWrStat(wrOn, input.total.hydro_res_)).toBeCloseTo(0.2)
      expect(readPandoStat(pandoOn, own.final.res_.hydro)).toBeCloseTo(0.2)
    })
  })

  describe('DefendersWill', () => {
    const set: ArtifactSetKey = 'DefendersWill'
    test('4pc geo RES from party geo tally', () => {
      const wr4 = buildWrSolo(withSet(set, 4))
      const pando4 = buildPando(withSet(set, 4))
      assertFinals(wr4, pando4)
      // WR tally[ele] is teamBuff; computeUIData solo does not apply it.
      expect(readWrStat(wr4, input.total.geo_res_)).toBeCloseTo(0)
      expect(readPandoStat(pando4, own.final.res_.geo)).toBeCloseTo(0.3)
      expect(readPandoStat(pando4, own.final.res_.pyro)).toBeCloseTo(0)
    })
  })

  describe('Lavawalker', () => {
    const set: ArtifactSetKey = 'Lavawalker'
    test('2pc pyro RES', () => {
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      expectClose(
        readWrStat(wr2, input.total.pyro_res_),
        readPandoStat(pando2, own.final.res_.pyro),
        '2pc pyro_res_'
      )
      expect(readWrStat(wr2, input.total.pyro_res_)).toBeCloseTo(0.4)
    })
  })

  describe('Thundersoother', () => {
    const set: ArtifactSetKey = 'Thundersoother'
    test('2pc electro RES', () => {
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      expectClose(
        readWrStat(wr2, input.total.electro_res_),
        readPandoStat(pando2, own.final.res_.electro),
        '2pc electro_res_'
      )
      expect(readWrStat(wr2, input.total.electro_res_)).toBeCloseTo(0.4)
    })
  })

  describe('TravelingDoctor', () => {
    const set: ArtifactSetKey = 'TravelingDoctor'
    test('2pc incHeal_; 4pc heal listing', () => {
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      expectClose(
        readWrStat(wr2, input.total.incHeal_),
        readPandoStat(pando2, own.final.incHeal_),
        '2pc incHeal_'
      )
      expect(readWrStat(wr2, input.total.incHeal_)).toBeCloseTo(0.2)
      expect(pandoListingNames(pando2)).not.toContain('heal')

      const wr4 = buildWrSolo(withSet(set, 4))
      const pando4 = buildPando(withSet(set, 4))
      assertFinals(wr4, pando4)
      assertPandoListingsFinite(pando4)
      expect(pandoListingNames(pando4)).toContain('heal')
      const heal = pando4
        .listFormulas(own.listing.formulas)
        .find((x) => x.tag.name === 'heal' && x.tag.sheet === set)
      expect(heal).toBeTruthy()
      expect(readPandoStat(pando4, heal!)).toBeCloseTo(
        0.2 * readPandoStat(pando4, own.final.hp)
      )
    })
  })

  describe('MaidenBeloved', () => {
    const set: ArtifactSetKey = 'MaidenBeloved'
    test('4pc team incHeal_ (Pando add; WR teamBuff hidden in solo UIData)', () => {
      const off = withSet(set, 4)
      const on = withSet(set, 4, {
        wrConditionals: { MaidenBeloved: { state: 'on' } },
        pandoConditionals: [pandoCond(set, 'state')],
      })
      const pandoOff = buildPando(off)
      const pandoOn = buildPando(on)
      expect(readPandoStat(pandoOff, own.final.incHeal_)).toBeCloseTo(0)
      expect(readPandoStat(pandoOn, own.final.incHeal_)).toBeCloseTo(0.2)
    })
  })

  describe('DesertPavilionChronicle', () => {
    const set: ArtifactSetKey = 'DesertPavilionChronicle'
    test('4pc atkSPD_', () => {
      const off = withSet(set, 4)
      const on = withSet(set, 4, {
        wrConditionals: { DesertPavilionChronicle: { set4: 'on' } },
        pandoConditionals: [pandoCond(set, 'set4')],
      })
      const wrOff = buildWrSolo(off)
      const wrOn = buildWrSolo(on)
      const pandoOff = buildPando(off)
      const pandoOn = buildPando(on)
      expectClose(
        readWrStat(wrOff, input.total.atkSPD_),
        readPandoStat(pandoOff, own.final.atkSPD_),
        '4pc atkSPD_ off'
      )
      expectClose(
        readWrStat(wrOn, input.total.atkSPD_),
        readPandoStat(pandoOn, own.final.atkSPD_),
        '4pc atkSPD_ on'
      )
      expect(readWrStat(wrOn, input.total.atkSPD_)).toBeCloseTo(0.1)
      expect(readPandoStat(pandoOn, own.final.atkSPD_)).toBeCloseTo(0.1)
    })
  })

  describe('SongOfDaysPast', () => {
    const set: ArtifactSetKey = 'SongOfDaysPast'
    test('4pc healing → team formula.base (Pando; WR teamBuff hidden in solo UIData)', () => {
      const off = withSet(set, 4)
      const on = withSet(set, 4, {
        wrConditionals: { SongOfDaysPast: { healing: '5000' } },
        pandoConditionals: [pandoCond(set, 'healing', SONG_HEAL_5000_INDEX)],
      })
      const pandoOff = buildPando(off)
      const pandoOn = buildPando(on)
      expect(
        readPandoStat(pandoOn, own.formula.base.normal) -
          readPandoStat(pandoOff, own.formula.base.normal)
      ).toBeCloseTo(400)
      expect(
        readPandoStat(pandoOn, own.formula.base.skill) -
          readPandoStat(pandoOff, own.formula.base.skill)
      ).toBeCloseTo(400)
      expect(
        readPandoStat(pandoOn, own.formula.base.burst) -
          readPandoStat(pandoOff, own.formula.base.burst)
      ).toBeCloseTo(400)
    })
  })

  describe('OceanHuedClam', () => {
    const set: ArtifactSetKey = 'OceanHuedClam'
    test('4pc foam listing', () => {
      const pando2 = buildPando(withSet(set, 2))
      expect(pandoListingNames(pando2)).not.toContain('foam')

      const pando4 = buildPando(withSet(set, 4))
      assertPandoListingsFinite(pando4)
      expect(pandoListingNames(pando4)).toContain('foam')
      const foam = pando4
        .listFormulas(own.listing.formulas)
        .find((x) => x.tag.name === 'foam' && x.tag.sheet === set)
      expect(foam).toBeTruthy()
      expect(foam?.tag.ele).toBe('physical')
      expect(readPandoStat(pando4, foam!)).toBeGreaterThan(0)
    })
  })

  describe('CelestialGift', () => {
    const set: ArtifactSetKey = 'CelestialGift'
    test('4pc hexerei geo_dmg_ light / hymn', () => {
      const condOn = {
        wrConditionals: { CelestialGift: { set4: 'on' } },
        pandoConditionals: [pandoCond(set, 'set4')],
      }
      const light = withSet(set, 4, {
        ...condOn,
        extraPando: withMember('0', hexereiTally(1)),
      })
      const hymn = withSet(set, 4, {
        ...condOn,
        extraPando: withMember('0', hexereiTally(2)),
      })
      const pandoLight = buildPando(light)
      const pandoHymn = buildPando(hymn)
      expect(readPandoStat(pandoLight, own.final.dmg_.geo)).toBeCloseTo(0.2)
      expect(readPandoStat(pandoLight, own.final.dmg_.pyro)).toBeCloseTo(0)
      expect(readPandoStat(pandoHymn, own.final.dmg_.geo)).toBeCloseTo(0.6)
    })
  })
})
