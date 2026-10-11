/**
 * Emilie WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * a4Burning all_dmg_ is ownBuff but not in DEFAULT_FINALS.
 * c2Hit is enemy dendro preRes (WR teamBuff, not dest-gated).
 * c6Fragrance NA/CA dmgInc is formula.base (not DEFAULT_FINALS).
 * C6 dendro infusion is listing-local (infusionPrio has no dendro).
 *
 *   nx test gi-pando-parity -- emilie.spec.ts
 */
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
        key: 'Emilie',
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
        location: 'Emilie',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1',
  'a4_dmg_',
  'burst',
  'burst_cd',
  'burst_duration',
  'burst_enerCost',
  'c6_charged_dmgInc',
  'c6_normal_dmgInc',
  'charged',
  'charged_stam',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_cd',
  'skill_duration',
  'skill_level1',
  'skill_level2',
  'skill_thorn',
  'skill_thornInterval',
]

function withConds(
  a4Burning: boolean,
  c2Hit: boolean,
  c6Fragrance: boolean
): ParityFixture {
  const wrEmilie: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4Burning) {
    wrEmilie.a4Burning = 'on'
    pandoConditionals.push({
      sheet: 'Emilie',
      src: '0',
      dst: null,
      name: 'a4Burning',
      value: 1,
    })
  }
  if (c2Hit) {
    wrEmilie.c2Hit = 'on'
    pandoConditionals.push({
      sheet: 'Emilie',
      src: '0',
      dst: null,
      name: 'c2Hit',
      value: 1,
    })
  }
  if (c6Fragrance) {
    wrEmilie.c6Fragrance = 'on'
    pandoConditionals.push({
      sheet: 'Emilie',
      src: '0',
      dst: null,
      name: 'c6Fragrance',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Emilie: wrEmilie },
    pandoConditionals,
  }
}

describe('Emilie WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (a4Burning=%s c2Hit=%s c6Fragrance=%s)', (a4Burning, c2Hit, c6Fragrance) => {
    const fixture =
      a4Burning || c2Hit || c6Fragrance
        ? withConds(a4Burning, c2Hit, c6Fragrance)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
