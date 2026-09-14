/**
 * Artifact batch selfC WR ↔ Pando set-bonus probes.
 * Dummy char is Noelle (ported). Empty art stats = set bonus only.
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { type Calculator, own } from '@genshin-optimizer/gi/formula'
import { input, type NumNode } from '@genshin-optimizer/gi/wr'
import {
  artSetPieces,
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type PandoConditionalSpec,
  type ParityFixture,
  readPandoArtSet,
  readWrArtSet,
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

function withSet(
  set: ArtifactSetKey,
  n: 0 | 2 | 4,
  opts?: {
    wrConditionals?: WrConditionalBag
    pandoConditionals?: readonly PandoConditionalSpec[]
  }
): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  return {
    ...NOELLE_BASE,
    members: [{ ...member, arts: artSetPieces(set, n) }],
    wrConditionals: opts?.wrConditionals,
    pandoConditionals: opts?.pandoConditionals,
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
  return { wr, pando, fixture }
}

describe('artifacts-selfC WR ↔ Pando', () => {
  describe('MartialArtist', () => {
    const set: ArtifactSetKey = 'MartialArtist'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc NA/CA dmg; 4pc state off/on', () => {
      const off = withSet(set, 4)
      const on = withSet(set, 4, {
        wrConditionals: { MartialArtist: { state: 'on' } },
        pandoConditionals: [pandoCond(set, 'state')],
      })
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      expectClose(
        readWrStat(wr2, input.total.normal_dmg_),
        readPandoStat(pando2, own.premod.dmg_.normal),
        '2pc normal_dmg_'
      )
      expectClose(
        readWrStat(wr2, input.total.charged_dmg_),
        readPandoStat(pando2, own.premod.dmg_.charged),
        '2pc charged_dmg_'
      )

      const wrOff = buildWrSolo(off)
      const pandoOff = buildPando(off)
      const wrOn = buildWrSolo(on)
      const pandoOn = buildPando(on)
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOff, input.total.normal_dmg_),
        readPandoStat(pandoOff, own.premod.dmg_.normal),
        '4pc off normal_dmg_'
      )
      expectClose(
        readWrStat(wrOn, input.total.normal_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.normal),
        '4pc on normal_dmg_'
      )
      expect(readWrStat(wrOn, input.total.normal_dmg_)).toBeGreaterThan(
        readWrStat(wrOff, input.total.normal_dmg_)
      )
    })
  })

  describe('NighttimeWhispersInTheEchoingWoods', () => {
    const set: ArtifactSetKey = 'NighttimeWhispersInTheEchoingWoods'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc atk; 4pc afterSkill / crystallize', () => {
      const wr0 = buildWrSolo(withSet(set, 0))
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      assertFinals(wr2, pando2)
      expect(readWrFinalAtk(wr2)).toBeGreaterThan(readWrFinalAtk(wr0))

      const skill = {
        wrConditionals: { [set]: { afterSkill: 'on' } },
        pandoConditionals: [pandoCond(set, 'afterSkill')],
      }
      const both = {
        wrConditionals: { [set]: { afterSkill: 'on', crystallize: 'on' } },
        pandoConditionals: [
          pandoCond(set, 'afterSkill'),
          pandoCond(set, 'crystallize'),
        ],
      }
      const wrOff = buildWrSolo(withSet(set, 4))
      const wrSkill = buildWrSolo(withSet(set, 4, skill))
      const pandoSkill = buildPando(withSet(set, 4, skill))
      const wrBoth = buildWrSolo(withSet(set, 4, both))
      const pandoBoth = buildPando(withSet(set, 4, both))
      assertFinals(wrBoth, pandoBoth)
      expectClose(
        readWrStat(wrSkill, input.total.geo_dmg_),
        readPandoStat(pandoSkill, own.premod.dmg_.geo),
        '4pc afterSkill geo_dmg_'
      )
      expectClose(
        readWrStat(wrBoth, input.total.geo_dmg_),
        readPandoStat(pandoBoth, own.premod.dmg_.geo),
        '4pc afterSkill+crystallize geo_dmg_'
      )
      expect(readWrStat(wrSkill, input.total.geo_dmg_)).toBeGreaterThan(
        readWrStat(wrOff, input.total.geo_dmg_)
      )
      expect(readWrStat(wrBoth, input.total.geo_dmg_)).toBeGreaterThan(
        readWrStat(wrSkill, input.total.geo_dmg_)
      )
    })
  })

  describe('ObsidianCodex', () => {
    const set: ArtifactSetKey = 'ObsidianCodex'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc nightsoul dmg; 4pc consume CR', () => {
      const blessing = {
        wrConditionals: { [set]: { '2NightsoulBlessing': 'on' } },
        pandoConditionals: [pandoCond(set, '2NightsoulBlessing')],
      }
      const consume = {
        wrConditionals: { [set]: { '4NightsoulConsume': 'on' } },
        pandoConditionals: [pandoCond(set, '4NightsoulConsume')],
      }
      const wr2off = buildWrSolo(withSet(set, 2))
      const wr2on = buildWrSolo(withSet(set, 2, blessing))
      const pando2on = buildPando(withSet(set, 2, blessing))
      expectClose(
        readWrStat(wr2on, input.total.all_dmg_),
        readPandoStat(pando2on, own.premod.dmg_),
        '2pc all_dmg_'
      )
      expect(readWrStat(wr2on, input.total.all_dmg_)).toBeGreaterThan(
        readWrStat(wr2off, input.total.all_dmg_)
      )

      const wr4off = buildWrSolo(withSet(set, 4))
      const wr4on = buildWrSolo(withSet(set, 4, consume))
      const pando4on = buildPando(withSet(set, 4, consume))
      assertFinals(wr4on, pando4on)
      expectClose(
        readWrStat(wr4on, input.total.critRate_),
        readPandoStat(pando4on, own.premod.critRate_),
        '4pc critRate_'
      )
      expect(readWrStat(wr4on, input.total.critRate_)).toBeGreaterThan(
        readWrStat(wr4off, input.total.critRate_)
      )
    })
  })

  describe('RetracingBolide', () => {
    const set: ArtifactSetKey = 'RetracingBolide'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc shield; 4pc state NA/CA', () => {
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      expectClose(
        readWrStat(wr2, input.total.shield_),
        readPandoStat(pando2, own.premod.shield_),
        '2pc shield_'
      )
      const on = {
        wrConditionals: { [set]: { state: 'on' } },
        pandoConditionals: [pandoCond(set, 'state')],
      }
      const wrOff = buildWrSolo(withSet(set, 4))
      const wrOn = buildWrSolo(withSet(set, 4, on))
      const pandoOn = buildPando(withSet(set, 4, on))
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOn, input.total.normal_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.normal),
        '4pc normal_dmg_'
      )
      expectClose(
        readWrStat(wrOn, input.total.charged_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.charged),
        '4pc charged_dmg_'
      )
      expect(readWrStat(wrOn, input.total.normal_dmg_)).toBeGreaterThan(
        readWrStat(wrOff, input.total.normal_dmg_)
      )
    })
  })

  describe('ScarletProof', () => {
    const set: ArtifactSetKey = 'ScarletProof'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc atk; 4pc 4Ss CR + stellarswirl', () => {
      const wr0 = buildWrSolo(withSet(set, 0))
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      assertFinals(wr2, pando2)
      expect(readWrFinalAtk(wr2)).toBeGreaterThan(readWrFinalAtk(wr0))

      const on = {
        wrConditionals: { [set]: { '4Ss': 'on' } },
        pandoConditionals: [pandoCond(set, '4Ss')],
      }
      const wrOff = buildWrSolo(withSet(set, 4))
      const wrOn = buildWrSolo(withSet(set, 4, on))
      const pandoOn = buildPando(withSet(set, 4, on))
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOn, input.total.critRate_),
        readPandoStat(pandoOn, own.premod.critRate_),
        '4pc critRate_'
      )
      expectClose(
        readWrStat(wrOn, input.total.stellarswirl_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.stellarswirl),
        '4pc stellarswirl_dmg_'
      )
      expect(readWrStat(wrOn, input.total.critRate_)).toBeGreaterThan(
        readWrStat(wrOff, input.total.critRate_)
      )
    })
  })

  describe('ShimenawasReminiscence', () => {
    const set: ArtifactSetKey = 'ShimenawasReminiscence'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc atk; 4pc usedEnergy NA/CA/plunge', () => {
      const wr0 = buildWrSolo(withSet(set, 0))
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      assertFinals(wr2, pando2)
      expect(readWrFinalAtk(wr2)).toBeGreaterThan(readWrFinalAtk(wr0))

      const on = {
        wrConditionals: { [set]: { usedEnergy: 'used' } },
        pandoConditionals: [pandoCond(set, 'usedEnergy')],
      }
      const wrOff = buildWrSolo(withSet(set, 4))
      const wrOn = buildWrSolo(withSet(set, 4, on))
      const pandoOn = buildPando(withSet(set, 4, on))
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOn, input.total.normal_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.normal),
        '4pc normal_dmg_'
      )
      expectClose(
        readWrStat(wrOn, input.total.charged_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.charged),
        '4pc charged_dmg_'
      )
      expectClose(
        readWrStat(wrOn, input.total.plunging_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.plunging),
        '4pc plunging_dmg_'
      )
      expect(readWrStat(wrOn, input.total.normal_dmg_)).toBeGreaterThan(
        readWrStat(wrOff, input.total.normal_dmg_)
      )
    })
  })

  describe('Thundersoother', () => {
    const set: ArtifactSetKey = 'Thundersoother'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('4pc state all_dmg_', () => {
      const on = {
        wrConditionals: { [set]: { state: 'on' } },
        pandoConditionals: [pandoCond(set, 'state')],
      }
      const wrOff = buildWrSolo(withSet(set, 4))
      const wrOn = buildWrSolo(withSet(set, 4, on))
      const pandoOn = buildPando(withSet(set, 4, on))
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOn, input.total.all_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_),
        '4pc all_dmg_'
      )
      expect(readWrStat(wrOn, input.total.all_dmg_)).toBeGreaterThan(
        readWrStat(wrOff, input.total.all_dmg_)
      )
    })
  })

  describe('UnfinishedReverie', () => {
    const set: ArtifactSetKey = 'UnfinishedReverie'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc atk; 4pc stacks all_dmg_', () => {
      const wr0 = buildWrSolo(withSet(set, 0))
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      assertFinals(wr2, pando2)
      expect(readWrFinalAtk(wr2)).toBeGreaterThan(readWrFinalAtk(wr0))

      const stacks = {
        wrConditionals: { [set]: { stacks: '5' } },
        pandoConditionals: [pandoCond(set, 'stacks', 5)],
      }
      const wrOff = buildWrSolo(withSet(set, 4))
      const wrOn = buildWrSolo(withSet(set, 4, stacks))
      const pandoOn = buildPando(withSet(set, 4, stacks))
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOn, input.total.all_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_),
        '4pc stacks all_dmg_'
      )
      expect(readWrStat(wrOn, input.total.all_dmg_)).toBeGreaterThan(
        readWrStat(wrOff, input.total.all_dmg_)
      )
    })
  })

  describe('VourukashasGlow', () => {
    const set: ArtifactSetKey = 'VourukashasGlow'
    test('0pc / 2pc / 4pc counts', () => {
      for (const n of [0, 2, 4] as const) checkCounts(set, n)
    })
    test('2pc hp; 4pc skill/burst + set4 stacks', () => {
      const wr0 = buildWrSolo(withSet(set, 0))
      const wr2 = buildWrSolo(withSet(set, 2))
      const pando2 = buildPando(withSet(set, 2))
      assertFinals(wr2, pando2)
      expect(readWrStat(wr2, input.total.hp)).toBeGreaterThan(
        readWrStat(wr0, input.total.hp)
      )

      const wr4 = buildWrSolo(withSet(set, 4))
      const pando4 = buildPando(withSet(set, 4))
      expectClose(
        readWrStat(wr4, input.total.skill_dmg_),
        readPandoStat(pando4, own.premod.dmg_.skill),
        '4pc skill_dmg_ base'
      )
      const stacks = {
        wrConditionals: { [set]: { set4: '5' } },
        pandoConditionals: [pandoCond(set, 'set4', 5)],
      }
      const wrOn = buildWrSolo(withSet(set, 4, stacks))
      const pandoOn = buildPando(withSet(set, 4, stacks))
      assertFinals(wrOn, pandoOn)
      expectClose(
        readWrStat(wrOn, input.total.skill_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.skill),
        '4pc skill_dmg_ stacks'
      )
      expectClose(
        readWrStat(wrOn, input.total.burst_dmg_),
        readPandoStat(pandoOn, own.premod.dmg_.burst),
        '4pc burst_dmg_ stacks'
      )
      expect(readWrStat(wrOn, input.total.skill_dmg_)).toBeGreaterThan(
        readWrStat(wr4, input.total.skill_dmg_)
      )
    })
  })
})

function readWrFinalAtk(wr: ReturnType<typeof buildWrSolo>): number {
  return readWrStat(wr, input.total.atk)
}
