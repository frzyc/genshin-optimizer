/**
 * Sandrone WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `a1Decoding` / `c1Decoding`. List `a0StellarRadianceSc` `'on'`|`'ss'`
 * (Pando 1-based). Num `a1Tactics` 0–10 / `c2Stacks` 0–3. C3 auto / C5 burst.
 * A0/C1 stellar dmg_ are teamBuff (not in DEFAULT_FINALS). A4 eleMas is ownBuff.
 *
 *   nx test gi-pando-parity -- sandrone.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Sandrone',
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
        location: 'Sandrone',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_stellarconduct_baseDmg_',
  'a0_stellarswirl_baseDmg_',
  'a4_eleMas',
  'burst_bombardDmg',
  'burst_rayDmg',
  'c6',
  'charged_beamDmg',
  'charged_overdriveDmg',
  'charged_sweepDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_prismDmg1',
  'skill_prismDmg2',
]

const STELLAR_ON_LISTINGS = [
  'burst_rayStellarDmg',
  'c4',
  'c6_dmg2',
  'charged_beamStellarDmg',
  'skill_prismStellarDmg',
]

const STELLAR_SS_LISTINGS = [
  'burst_raySsDmg',
  'c4_ssDmg',
  'c6_ssDmg',
  'charged_beamSsDmg',
  'skill_prismSsDmg',
]

type SandroneConds = {
  a0StellarRadianceSc?: 'on' | 'ss'
  a1Decoding?: boolean
  a1Tactics?: number
  c1Decoding?: boolean
  c2Stacks?: number
}

function withConds(conds: SandroneConds): ParityFixture {
  const wrSandrone: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.a0StellarRadianceSc) {
    wrSandrone.a0StellarRadianceSc = conds.a0StellarRadianceSc
    pandoConditionals.push({
      sheet: 'Sandrone',
      src: '0',
      dst: null,
      name: 'a0StellarRadianceSc',
      value: conds.a0StellarRadianceSc === 'on' ? 1 : 2,
    })
  }
  if (conds.a1Decoding) {
    wrSandrone.a1Decoding = 'on'
    pandoConditionals.push({
      sheet: 'Sandrone',
      src: '0',
      dst: null,
      name: 'a1Decoding',
      value: 1,
    })
  }
  if (conds.a1Tactics) {
    wrSandrone.a1Tactics = String(conds.a1Tactics)
    pandoConditionals.push({
      sheet: 'Sandrone',
      src: '0',
      dst: null,
      name: 'a1Tactics',
      value: conds.a1Tactics,
    })
  }
  if (conds.c1Decoding) {
    wrSandrone.c1Decoding = 'on'
    pandoConditionals.push({
      sheet: 'Sandrone',
      src: '0',
      dst: null,
      name: 'c1Decoding',
      value: 1,
    })
  }
  if (conds.c2Stacks) {
    wrSandrone.c2Stacks = String(conds.c2Stacks)
    pandoConditionals.push({
      sheet: 'Sandrone',
      src: '0',
      dst: null,
      name: 'c2Stacks',
      value: conds.c2Stacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Sandrone: wrSandrone },
    pandoConditionals,
  }
}

describe('Sandrone WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a1Decoding: true }],
    [{ a1Decoding: true, a1Tactics: 10 }],
    [{ c1Decoding: true }],
    [{ a0StellarRadianceSc: 'on' as const, c2Stacks: 3 }],
    [{ a0StellarRadianceSc: 'ss' as const }],
    [
      {
        a0StellarRadianceSc: 'on' as const,
        a1Decoding: true,
        a1Tactics: 10,
        c1Decoding: true,
        c2Stacks: 3,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (conds.a0StellarRadianceSc === 'on') {
      expect(pandoListingNames(pando)).toEqual(
        expect.arrayContaining(STELLAR_ON_LISTINGS)
      )
    }
    if (conds.a0StellarRadianceSc === 'ss') {
      expect(pandoListingNames(pando)).toEqual(
        expect.arrayContaining(STELLAR_SS_LISTINGS)
      )
    }
  })

  test('c1Decoding adds team stellarconduct / stellarswirl dmg_', () => {
    const off = buildPando(FIXTURE)
    const on = buildPando(withConds({ c1Decoding: true }))
    const offSc = off.compute(own.final.dmg_.stellarconduct).val as number
    const offSs = off.compute(own.final.dmg_.stellarswirl).val as number
    expect(on.compute(own.final.dmg_.stellarconduct).val).toBeCloseTo(
      offSc + 0.3
    )
    expect(on.compute(own.final.dmg_.stellarswirl).val).toBeCloseTo(offSs + 0.3)
    assertFinals(buildWrSolo(withConds({ c1Decoding: true })), on)
  })
})
