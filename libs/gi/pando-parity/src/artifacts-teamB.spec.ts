/**
 * Artifact WR ↔ Pando parity — teamB
 * HuskOfOpulentDreams, Instructor, MaidenBeloved, NightOfTheSkysUnveiling,
 * NymphsDream, PaleFlame, ScrollOfTheHeroOfCinderCity
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { type Calculator, own } from '@genshin-optimizer/gi/formula'
import { input } from '@genshin-optimizer/gi/wr'
import {
  artSetPieces,
  assertFinals,
  buildPando,
  buildWrSolo,
  type PandoConditionalSpec,
  type ParityFixture,
  type WrConditionalBag,
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

function fixture(
  set: ArtifactSetKey,
  n: 0 | 2 | 4,
  wrConditionals?: WrConditionalBag,
  pandoConditionals?: readonly PandoConditionalSpec[]
): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  return {
    ...NOELLE_BASE,
    members: [{ ...member, arts: artSetPieces(set, n) }],
    ...(wrConditionals ? { wrConditionals } : {}),
    ...(pandoConditionals ? { pandoConditionals } : {}),
  }
}

function pandoCond(
  sheet: ArtifactSetKey,
  name: string,
  value: number
): PandoConditionalSpec {
  return { sheet, src: '0', dst: null, name, value }
}

function assertClose(wrVal: number, pandoVal: number, label: string): void {
  expect(Number.isFinite(wrVal), `WR ${label}`).toBe(true)
  expect(Number.isFinite(pandoVal), `Pando ${label}`).toBe(true)
  expect(
    relDiff(wrVal, pandoVal),
    `${label} wr=${wrVal} pando=${pandoVal}`
  ).toBeLessThan(REL_TOL)
}

function wrTotal(
  wr: ReturnType<typeof buildWrSolo>,
  stat: 'heal_' | 'geo_dmg_' | 'hydro_dmg_' | 'physical_dmg_'
): number {
  return wr.get(input.total[stat]).value as number
}

function pandoDmg(
  pando: Calculator,
  ele: 'geo' | 'hydro' | 'physical' | 'pyro' | 'lunarcharged'
): number {
  return pando.compute(own.final.dmg_[ele]).val as number
}

function run(fx: ParityFixture) {
  return { wr: buildWrSolo(fx), pando: buildPando(fx) }
}

describe('artifacts teamB WR ↔ Pando', () => {
  describe('HuskOfOpulentDreams', () => {
    const set = 'HuskOfOpulentDreams' as const

    test('0pc / 2pc / 4pc finals', () => {
      for (const n of [0, 2, 4] as const) {
        const { wr, pando } = run(fixture(set, n))
        assertFinals(wr, pando)
      }
    })

    test('2pc def_ vs 0pc', () => {
      const z = run(fixture(set, 0))
      const t = run(fixture(set, 2))
      assertFinals(t.wr, t.pando)
      expect(wrTotal(t.wr, 'geo_dmg_')).toBeCloseTo(wrTotal(z.wr, 'geo_dmg_'))
      expect(t.pando.compute(own.final.def).val).toBeGreaterThan(
        z.pando.compute(own.final.def).val
      )
    })

    test('4pc stack 4 def_ + geo dmg', () => {
      const off = run(fixture(set, 4))
      const on = run(
        fixture(set, 4, { [set]: { stack: '4' } }, [pandoCond(set, 'stack', 4)])
      )
      assertFinals(off.wr, off.pando)
      assertFinals(on.wr, on.pando)
      expect(on.pando.compute(own.final.def).val).toBeGreaterThan(
        off.pando.compute(own.final.def).val
      )
      assertClose(
        wrTotal(on.wr, 'geo_dmg_'),
        pandoDmg(on.pando, 'geo'),
        'geo_dmg_ stack4'
      )
      expect(wrTotal(on.wr, 'geo_dmg_')).toBeCloseTo(0.24)
      expect(pandoDmg(on.pando, 'geo')).toBeCloseTo(0.24)
    })
  })

  describe('Instructor', () => {
    const set = 'Instructor' as const

    test('0pc / 2pc / 4pc finals', () => {
      for (const n of [0, 2, 4] as const) {
        const { wr, pando } = run(fixture(set, n))
        assertFinals(wr, pando)
      }
    })

    test('2pc +80 EM; 4pc set4 team EM +120', () => {
      const z = run(fixture(set, 0))
      const two = run(fixture(set, 2))
      const fourOff = run(fixture(set, 4))
      const fourOn = run(
        fixture(set, 4, { [set]: { set4: 'on' } }, [pandoCond(set, 'set4', 1)])
      )
      assertFinals(two.wr, two.pando)
      assertFinals(fourOff.wr, fourOff.pando)
      expect(two.pando.compute(own.final.eleMas).val).toBeCloseTo(
        z.pando.compute(own.final.eleMas).val + 80
      )
      expect(fourOff.pando.compute(own.final.eleMas).val).toBeCloseTo(
        two.pando.compute(own.final.eleMas).val
      )
      // WR teamBuff/nonStack is not visible in computeUIData; Pando addOnce is.
      expect(fourOn.pando.compute(own.final.eleMas).val).toBeCloseTo(
        fourOff.pando.compute(own.final.eleMas).val + 120
      )
    })
  })

  describe('MaidenBeloved', () => {
    const set = 'MaidenBeloved' as const

    test('0pc / 2pc / 4pc finals', () => {
      for (const n of [0, 2, 4] as const) {
        const { wr, pando } = run(fixture(set, n))
        assertFinals(wr, pando)
      }
    })

    test('2pc heal_ +15%', () => {
      const z = run(fixture(set, 0))
      const two = run(fixture(set, 2))
      const four = run(fixture(set, 4))
      assertClose(
        wrTotal(z.wr, 'heal_'),
        z.pando.compute(own.final.heal_).val,
        '0pc heal_'
      )
      assertClose(
        wrTotal(two.wr, 'heal_'),
        two.pando.compute(own.final.heal_).val,
        '2pc heal_'
      )
      expect(wrTotal(two.wr, 'heal_')).toBeCloseTo(0.15)
      assertClose(
        wrTotal(four.wr, 'heal_'),
        four.pando.compute(own.final.heal_).val,
        '4pc heal_'
      )
      expect(wrTotal(four.wr, 'heal_')).toBeCloseTo(wrTotal(two.wr, 'heal_'))
    })
  })

  describe('NightOfTheSkysUnveiling', () => {
    const set = 'NightOfTheSkysUnveiling' as const

    test('0pc / 2pc / 4pc finals', () => {
      for (const n of [0, 2, 4] as const) {
        const { wr, pando } = run(fixture(set, n))
        assertFinals(wr, pando)
      }
    })

    test('2pc +80 EM; 4pc Gleaming Moon lunar dmg (no moonsign)', () => {
      const z = run(fixture(set, 0))
      const two = run(fixture(set, 2))
      const fourOff = run(fixture(set, 4))
      const fourOn = run(
        fixture(set, 4, { [set]: { '4GleamingMoon': 'on' } }, [
          pandoCond(set, '4GleamingMoon', 1),
        ])
      )
      assertFinals(two.wr, two.pando)
      assertFinals(fourOff.wr, fourOff.pando)
      assertFinals(fourOn.wr, fourOn.pando)
      expect(two.pando.compute(own.final.eleMas).val).toBeCloseTo(
        z.pando.compute(own.final.eleMas).val + 80
      )
      // No moonsign teammate → 4pc critRate_ stays 0 on both engines
      expect(fourOn.pando.compute(own.final.critRate_).val).toBeCloseTo(
        fourOff.pando.compute(own.final.critRate_).val
      )
      // WR teamBuff/nonStack is not visible in computeUIData; Pando addOnce is.
      expect(pandoDmg(fourOn.pando, 'lunarcharged')).toBeCloseTo(0.1)
    })
  })

  describe('NymphsDream', () => {
    const set = 'NymphsDream' as const

    test('0pc / 2pc / 4pc finals', () => {
      for (const n of [0, 2, 4] as const) {
        const { wr, pando } = run(fixture(set, n))
        assertFinals(wr, pando)
      }
    })

    test('2pc hydro 15%; 4pc set4=3 atk_ + hydro', () => {
      const two = run(fixture(set, 2))
      const fourOff = run(fixture(set, 4))
      const fourOn = run(
        fixture(set, 4, { [set]: { set4: '3' } }, [pandoCond(set, 'set4', 3)])
      )
      assertFinals(two.wr, two.pando)
      assertFinals(fourOff.wr, fourOff.pando)
      assertFinals(fourOn.wr, fourOn.pando)
      assertClose(
        wrTotal(two.wr, 'hydro_dmg_'),
        pandoDmg(two.pando, 'hydro'),
        '2pc hydro'
      )
      expect(wrTotal(two.wr, 'hydro_dmg_')).toBeCloseTo(0.15)
      expect(fourOn.pando.compute(own.final.atk).val).toBeGreaterThan(
        fourOff.pando.compute(own.final.atk).val
      )
      assertClose(
        wrTotal(fourOn.wr, 'hydro_dmg_'),
        pandoDmg(fourOn.pando, 'hydro'),
        '4pc hydro stack3'
      )
      expect(wrTotal(fourOn.wr, 'hydro_dmg_')).toBeCloseTo(0.3)
    })
  })

  describe('PaleFlame', () => {
    const set = 'PaleFlame' as const

    test('0pc / 2pc / 4pc finals', () => {
      for (const n of [0, 2, 4] as const) {
        const { wr, pando } = run(fixture(set, n))
        assertFinals(wr, pando)
      }
    })

    test('2pc physical 25%; 4pc stacks=2 atk_ + physical', () => {
      const two = run(fixture(set, 2))
      const fourOff = run(fixture(set, 4))
      const fourOn = run(
        fixture(set, 4, { [set]: { stacks: '2' } }, [
          pandoCond(set, 'stacks', 2),
        ])
      )
      assertFinals(two.wr, two.pando)
      assertFinals(fourOff.wr, fourOff.pando)
      assertFinals(fourOn.wr, fourOn.pando)
      assertClose(
        wrTotal(two.wr, 'physical_dmg_'),
        pandoDmg(two.pando, 'physical'),
        '2pc physical'
      )
      expect(wrTotal(two.wr, 'physical_dmg_')).toBeCloseTo(0.25)
      expect(fourOn.pando.compute(own.final.atk).val).toBeGreaterThan(
        fourOff.pando.compute(own.final.atk).val
      )
      assertClose(
        wrTotal(fourOn.wr, 'physical_dmg_'),
        pandoDmg(fourOn.pando, 'physical'),
        '4pc physical stacks2'
      )
      expect(wrTotal(fourOn.wr, 'physical_dmg_')).toBeCloseTo(0.5)
    })
  })

  describe('ScrollOfTheHeroOfCinderCity', () => {
    const set = 'ScrollOfTheHeroOfCinderCity' as const

    test('0pc / 2pc / 4pc finals', () => {
      for (const n of [0, 2, 4] as const) {
        const { wr, pando } = run(fixture(set, n))
        assertFinals(wr, pando)
      }
    })

    test('4pc react_geo 12%; nightsoul extra 28%', () => {
      const fourOff = run(fixture(set, 4))
      const base = run(
        fixture(set, 4, { [set]: { react_geo: 'geo' } }, [
          pandoCond(set, 'react_geo', 1),
        ])
      )
      const ns = run(
        fixture(set, 4, { [set]: { react_geo: 'geo', nightsoul_geo: 'geo' } }, [
          pandoCond(set, 'react_geo', 1),
          pandoCond(set, 'nightsoul_geo', 1),
        ])
      )
      assertFinals(fourOff.wr, fourOff.pando)
      assertFinals(base.wr, base.pando)
      assertFinals(ns.wr, ns.pando)
      // WR teamBuff/nonStack is not visible in computeUIData; Pando addOnce is.
      expect(pandoDmg(base.pando, 'geo')).toBeCloseTo(0.12)
      expect(pandoDmg(ns.pando, 'geo')).toBeCloseTo(0.4)
    })

    test('4pc react_pyro buffs pyro and wearer geo', () => {
      const on = run(
        fixture(set, 4, { [set]: { react_pyro: 'pyro' } }, [
          pandoCond(set, 'react_pyro', 1),
        ])
      )
      assertFinals(on.wr, on.pando)
      // WR teamBuff/nonStack is not visible in computeUIData; Pando addOnce is.
      expect(pandoDmg(on.pando, 'pyro')).toBeCloseTo(0.12)
      expect(pandoDmg(on.pando, 'geo')).toBeCloseTo(0.12)
    })
  })
})
