/**
 * Artifact WR ↔ Pando parity (batch selfB). Dummy: Noelle from harness.spec.ts.
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Calculator } from '@genshin-optimizer/gi/formula'
import { own } from '@genshin-optimizer/gi/formula'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { input } from '@genshin-optimizer/gi/wr'
import {
  artSetPieces,
  assertFinals,
  buildPando,
  buildWrSolo,
  DEFAULT_REL_TOL,
  type PandoConditionalSpec,
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

function ownCond(
  sheet: string,
  name: string,
  value: number
): PandoConditionalSpec {
  return { sheet, src: '0', dst: null, name, value }
}

function assertArtCount(
  wr: ReturnType<typeof buildWrSolo>,
  pando: Calculator,
  set: ArtifactSetKey,
  n: number
): void {
  expect(readWrArtSet(wr, set), `WR count ${set} n=${n}`).toBe(n)
  expect(readPandoArtSet(pando, set), `Pando count ${set} n=${n}`).toBe(n)
}

function assertBonus(
  wr: ReturnType<typeof buildWrSolo>,
  pando: Calculator,
  wrNode: NumNode,
  pandoRead: (typeof own)['final']['dmg_'],
  label: string
): void {
  const wrVal = wr.get(wrNode).value as number
  const pandoVal = pando.compute(pandoRead).val as number
  expect(
    relDiff(wrVal, pandoVal),
    `${label} wr=${wrVal} pando=${pandoVal}`
  ).toBeLessThan(DEFAULT_REL_TOL)
}

function probe(
  set: ArtifactSetKey,
  n: 0 | 2 | 4,
  extra: Partial<ParityFixture> = {}
) {
  const fixture = withSet(set, n, extra)
  const wr = buildWrSolo(fixture)
  const pando = buildPando(fixture)
  assertArtCount(wr, pando, set, n)
  assertFinals(wr, pando)
  return { wr, pando }
}

describe('artifacts-selfB WR ↔ Pando', () => {
  describe('FinaleOfTheDeepGalleries', () => {
    const set: ArtifactSetKey = 'FinaleOfTheDeepGalleries'
    test.each([0, 2, 4] as const)('%spc cryo 2pc', (n) => {
      const { wr, pando } = probe(set, n)
      assertBonus(
        wr,
        pando,
        input.total.cryo_dmg_,
        own.final.dmg_.cryo,
        `cryo n=${n}`
      )
    })
    test('4pc 0EnergyNoBurst → normal', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { '0EnergyNoBurst': 'on' } },
        pandoConditionals: [ownCond(set, '0EnergyNoBurst', 1)],
      })
      assertBonus(
        wr,
        pando,
        input.total.normal_dmg_,
        own.final.dmg_.normal,
        'normal'
      )
    })
    test('4pc 0EnergyNoNormal → burst', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { '0EnergyNoNormal': 'on' } },
        pandoConditionals: [ownCond(set, '0EnergyNoNormal', 1)],
      })
      assertBonus(
        wr,
        pando,
        input.total.burst_dmg_,
        own.final.dmg_.burst,
        'burst'
      )
    })
  })

  describe('FlowerOfParadiseLost', () => {
    const set: ArtifactSetKey = 'FlowerOfParadiseLost'
    test.each([0, 2, 4] as const)('%spc eleMas 2pc', (n) => {
      probe(set, n)
    })
    test('4pc stacks=4 bloom/lunarbloom', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { stacks: 4 } },
        pandoConditionals: [ownCond(set, 'stacks', 4)],
      })
      assertBonus(
        wr,
        pando,
        input.total.bloom_dmg_,
        own.final.dmg_.bloom,
        'bloom'
      )
      assertBonus(
        wr,
        pando,
        input.total.hyperbloom_dmg_,
        own.final.dmg_.hyperbloom,
        'hyperbloom'
      )
      assertBonus(
        wr,
        pando,
        input.total.burgeon_dmg_,
        own.final.dmg_.burgeon,
        'burgeon'
      )
      assertBonus(
        wr,
        pando,
        input.total.lunarbloom_dmg_,
        own.final.dmg_.lunarbloom,
        'lunarbloom'
      )
    })
  })

  describe('FragmentOfHarmonicWhimsy', () => {
    const set: ArtifactSetKey = 'FragmentOfHarmonicWhimsy'
    test.each([0, 2, 4] as const)('%spc atk_ 2pc', (n) => {
      probe(set, n)
    })
    test('4pc stacks=3 all_dmg_', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { stacks: 3 } },
        pandoConditionals: [ownCond(set, 'stacks', 3)],
      })
      assertBonus(wr, pando, input.total.all_dmg_, own.final.dmg_, 'all_dmg_')
    })
  })

  describe('GoldenTroupe', () => {
    const set: ArtifactSetKey = 'GoldenTroupe'
    test.each([0, 2, 4] as const)('%spc skill 2pc/4pc', (n) => {
      const { wr, pando } = probe(set, n)
      assertBonus(
        wr,
        pando,
        input.total.skill_dmg_,
        own.final.dmg_.skill,
        `skill n=${n}`
      )
    })
    test('4pc set4 off-field extra skill', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { set4: 'on' } },
        pandoConditionals: [ownCond(set, 'set4', 1)],
      })
      assertBonus(
        wr,
        pando,
        input.total.skill_dmg_,
        own.final.dmg_.skill,
        'skill set4'
      )
    })
  })

  describe('HeartOfDepth', () => {
    const set: ArtifactSetKey = 'HeartOfDepth'
    test.each([0, 2, 4] as const)('%spc hydro 2pc', (n) => {
      const { wr, pando } = probe(set, n)
      assertBonus(
        wr,
        pando,
        input.total.hydro_dmg_,
        own.final.dmg_.hydro,
        `hydro n=${n}`
      )
    })
    test('4pc skill=cast normal+charged', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { skill: 'cast' } },
        pandoConditionals: [ownCond(set, 'skill', 1)],
      })
      assertBonus(
        wr,
        pando,
        input.total.normal_dmg_,
        own.final.dmg_.normal,
        'normal'
      )
      assertBonus(
        wr,
        pando,
        input.total.charged_dmg_,
        own.final.dmg_.charged,
        'charged'
      )
    })
  })

  describe('Lavawalker', () => {
    const set: ArtifactSetKey = 'Lavawalker'
    test.each([0, 2, 4] as const)('%spc', (n) => {
      probe(set, n)
    })
    test('4pc state → all_dmg_', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { state: 'on' } },
        pandoConditionals: [ownCond(set, 'state', 1)],
      })
      assertBonus(wr, pando, input.total.all_dmg_, own.final.dmg_, 'all_dmg_')
    })
  })

  describe('LongNightsOath', () => {
    const set: ArtifactSetKey = 'LongNightsOath'
    test.each([0, 2, 4] as const)('%spc plunging 2pc', (n) => {
      const { wr, pando } = probe(set, n)
      assertBonus(
        wr,
        pando,
        input.total.plunging_dmg_,
        own.final.dmg_.plunging,
        `plunging n=${n}`
      )
    })
    test('4pc stacks=5 plunging', () => {
      const { wr, pando } = probe(set, 4, {
        wrConditionals: { [set]: { stacks: 5 } },
        pandoConditionals: [ownCond(set, 'stacks', 5)],
      })
      assertBonus(
        wr,
        pando,
        input.total.plunging_dmg_,
        own.final.dmg_.plunging,
        'plunging stacks'
      )
    })
  })

  describe('MarechausseeHunter', () => {
    const set: ArtifactSetKey = 'MarechausseeHunter'
    test.each([0, 2, 4] as const)('%spc normal/charged 2pc', (n) => {
      const { wr, pando } = probe(set, n)
      assertBonus(
        wr,
        pando,
        input.total.normal_dmg_,
        own.final.dmg_.normal,
        `normal n=${n}`
      )
      assertBonus(
        wr,
        pando,
        input.total.charged_dmg_,
        own.final.dmg_.charged,
        `charged n=${n}`
      )
    })
    test('4pc set4=3 critRate_', () => {
      probe(set, 4, {
        wrConditionals: { [set]: { set4: 3 } },
        pandoConditionals: [ownCond(set, 'set4', 3)],
      })
    })
  })
})
