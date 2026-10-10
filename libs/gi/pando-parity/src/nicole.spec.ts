/**
 * Nicole WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * Grace / A1 / C2 ATK are WR teamBuff.total.atk; solo computeUIData does not
 * apply them. skillGraceActive on: assertFinals skips `atk`.
 * lockHomework projection_dmgInc needs hexerei >= 2 (WR tally overlay + extra
 * Pando tally), same as Fischl / Durin.
 *
 *   nx test gi-pando-parity -- nicole.spec.ts
 */
import { hexereiTally, withMember } from '@genshin-optimizer/gi/formula'
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
        key: 'Nicole',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusCodex',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Nicole',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c4Pathfinder_burst_dmgInc',
  'c4Pathfinder_charged_dmgInc',
  'c4Pathfinder_normal_dmgInc',
  'c4Pathfinder_plunging_dmgInc',
  'c4Pathfinder_skill_dmgInc',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'projectionDmgInc',
  'skill',
  'skillGraceActive_atk',
  'skill_pyroShield',
  'skill_shield',
]

type NicoleConds = {
  lockHomework?: boolean
  skillGraceActive?: boolean
  a1GuidanceActive?: boolean
  a4NicoleGuidance?: boolean
  c4Pathfinder?: boolean
}

function withConds(conds: NicoleConds): ParityFixture {
  const wrNicole: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  for (const name of [
    'lockHomework',
    'skillGraceActive',
    'a1GuidanceActive',
    'a4NicoleGuidance',
    'c4Pathfinder',
  ] as const) {
    if (!conds[name]) continue
    wrNicole[name] = 'on'
    pandoConditionals.push({
      sheet: 'Nicole',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    ...(conds.lockHomework
      ? {
          wrTally: { hexerei: 2 },
          extraPando: withMember('0', hexereiTally(1)),
        }
      : {}),
    wrConditionals: { Nicole: wrNicole },
    pandoConditionals,
  }
}

describe('Nicole WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ skillGraceActive: true }],
    [{ skillGraceActive: true, a1GuidanceActive: true }],
    [{ skillGraceActive: true, a4NicoleGuidance: true }],
    [{ c4Pathfinder: true }],
    [{ lockHomework: true }],
    [
      {
        lockHomework: true,
        skillGraceActive: true,
        a1GuidanceActive: true,
        a4NicoleGuidance: true,
        c4Pathfinder: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.total.atk is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      conds.skillGraceActive
        ? DEFAULT_FINALS.filter((s) => s !== 'atk')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of EXPECTED_LISTINGS) {
      expect(names, name).toContain(name)
    }
  })
})
