/**
 * RaidenShogun WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * List conds: skillEye `'skillEye'`, c4 `'c4'`, skillEyeTeam energy, burstResolve stacks.
 * Bool InBurst `'on'`. C4 atk_ is notOwnBuff — skip `atk` when on.
 *
 *   nx test gi-pando-parity -- raidenshogun.spec.ts
 */
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
        key: 'RaidenShogun',
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
        location: 'RaidenShogun',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_charged1',
  'burst_charged2',
  'burst_hit1',
  'burst_hit2',
  'burst_hit3',
  'burst_hit41',
  'burst_hit42',
  'burst_hit5',
  'burst_plunge',
  'burst_plungeHigh',
  'burst_plungeLow',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_coorDmg',
]

function withConds(
  skillEye: boolean,
  inBurst: boolean,
  c4: boolean
): ParityFixture {
  const wrRaiden: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillEye) {
    wrRaiden.skillEye = 'skillEye'
    pandoConditionals.push({
      sheet: 'RaidenShogun',
      src: '0',
      dst: null,
      name: 'skillEye',
      value: 1,
    })
  }
  if (inBurst) {
    wrRaiden.InBurst = 'on'
    pandoConditionals.push({
      sheet: 'RaidenShogun',
      src: '0',
      dst: null,
      name: 'InBurst',
      value: 1,
    })
  }
  if (c4) {
    wrRaiden.c4 = 'c4'
    pandoConditionals.push({
      sheet: 'RaidenShogun',
      src: '0',
      dst: null,
      name: 'c4',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { RaidenShogun: wrRaiden },
    pandoConditionals,
  }
}

describe('RaidenShogun WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [true, true, true],
  ] as const)('aligned finals (skillEye=%s InBurst=%s c4=%s)', (skillEye, inBurst, c4) => {
    const fixture =
      skillEye || inBurst || c4 ? withConds(skillEye, inBurst, c4) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      c4 ? DEFAULT_FINALS.filter((s) => s !== 'atk') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
