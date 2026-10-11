/**
 * Iansan WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * WR `lookup` burstNs (states `'1'`..`'42'`) → Pando `allNumConditionals`
 * 0–42. Fixture: WR string key ↔ Pando integer. Burst ATK (total.atk) and C2
 * atk_ are dest-gated teamBuffs; solo computeUIData does not apply them.
 * burstNs / a1Precise on: assertFinals skips `atk`; Pando deltas are checked
 * instead. C6 Extreme Force is dest-gated `all_dmg_` (not in DEFAULT_FINALS).
 *
 *   nx test gi-pando-parity -- iansan.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  DEFAULT_FINALS,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Iansan',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusLance',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Iansan',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burstNs_atkDisp',
  'charged',
  'charged_swiftDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'passive2_heal',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

type IansanConds = {
  a1Precise?: boolean
  burstNs?: 0 | 20 | 42
  c6Extreme?: boolean
}

function withConds(conds: IansanConds): ParityFixture {
  const wrIansan: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.a1Precise) {
    wrIansan.a1Precise = 'on'
    pandoConditionals.push({
      sheet: 'Iansan',
      src: '0',
      dst: null,
      name: 'a1Precise',
      value: 1,
    })
  }
  if (conds.burstNs) {
    wrIansan.burstNs = String(conds.burstNs)
    pandoConditionals.push({
      sheet: 'Iansan',
      src: '0',
      dst: null,
      name: 'burstNs',
      value: conds.burstNs,
    })
  }
  if (conds.c6Extreme) {
    wrIansan.c6Extreme = 'on'
    pandoConditionals.push({
      sheet: 'Iansan',
      src: '0',
      dst: null,
      name: 'c6Extreme',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Iansan: wrIansan },
    pandoConditionals,
  }
}

describe('Iansan WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a1Precise: true }],
    [{ burstNs: 20 }],
    [{ burstNs: 42 }],
    [{ c6Extreme: true }],
    [{ a1Precise: true, burstNs: 42, c6Extreme: true }],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.total.atk / C2 atk_ are hidden in solo UIData; Pando applies them.
    assertFinals(
      wr,
      pando,
      conds.a1Precise || conds.burstNs
        ? DEFAULT_FINALS.filter((s) => s !== 'atk')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of EXPECTED_LISTINGS) {
      expect(names, name).toContain(name)
    }

    const off = buildPando(FIXTURE)
    // A1 own 20% + C2 dest-gated 30% on the on-fielder (solo destIsActive).
    expect(pando.compute(own.premod.atk_).val as number).toBeCloseTo(
      (off.compute(own.premod.atk_).val as number) + (conds.a1Precise ? 0.5 : 0)
    )
    if (conds.burstNs) {
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
    expect(pando.compute(own.premod.dmg_).val as number).toBeCloseTo(
      (off.compute(own.premod.dmg_).val as number) +
        (conds.c6Extreme ? 0.25 : 0)
    )
  })
})
