/**
 * Lohen WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockHomework` / `a4MasterCryo` / `a0HighSpirits` / `lockBuff` /
 * `c2Blade` / `c6BurstMaster` `'on'`. List `willConsumed` `'20'`…`'300'` —
 * Pando `value` is 1-based (WR `'100'` → 5). C3 skill / C5 burst.
 * lockBuff NA/CA dmg_ needs hexerei >= 2 (WR tally overlay + extra Pando tally).
 * A4 teammate atk_ and C2 EM are notOwnBuff — skip none of DEFAULT_FINALS.
 * Masterstroke NA/CA/plunge are listing-local cryo (skill talent).
 *
 *   nx test gi-pando-parity -- lohen.spec.ts
 */
import { hexereiTally, own, withMember } from '@genshin-optimizer/gi/formula'
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
        key: 'Lohen',
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
        location: 'Lohen',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c2',
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
  'skill_0',
  'skill_1',
  'skill_2',
  'skill_3',
  'skill_4',
  'skill_5',
  'skill_charged',
  'skill_etchDmg',
  'skill_plunging_dmg',
  'skill_plunging_high',
  'skill_plunging_low',
]

/** WR `'100'` — 1-based index into `['20','40',…,'300']`. */
const WILL_100_LIST_INDEX = 5

type LohenConds = {
  lockHomework?: boolean
  willConsumed100?: boolean
  a4MasterCryo?: boolean
  a0HighSpirits?: boolean
  lockBuff?: boolean
  c2Blade?: boolean
  c6BurstMaster?: boolean
}

function withConds(conds: LohenConds): ParityFixture {
  const wrLohen: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  for (const name of [
    'lockHomework',
    'a4MasterCryo',
    'a0HighSpirits',
    'lockBuff',
    'c2Blade',
    'c6BurstMaster',
  ] as const) {
    if (!conds[name]) continue
    wrLohen[name] = 'on'
    pandoConditionals.push({
      sheet: 'Lohen',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  if (conds.willConsumed100) {
    wrLohen.willConsumed = '100'
    pandoConditionals.push({
      sheet: 'Lohen',
      src: '0',
      dst: null,
      name: 'willConsumed',
      value: WILL_100_LIST_INDEX,
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
    wrConditionals: { Lohen: wrLohen },
    pandoConditionals,
  }
}

describe('Lohen WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a4MasterCryo: true }],
    [{ a0HighSpirits: true }],
    [{ willConsumed100: true }],
    [{ lockHomework: true, lockBuff: true }],
    [{ c2Blade: true }],
    [{ c6BurstMaster: true }],
    [
      {
        lockHomework: true,
        willConsumed100: true,
        a4MasterCryo: true,
        a0HighSpirits: true,
        lockBuff: true,
        c2Blade: true,
        c6BurstMaster: true,
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

    if (conds.a4MasterCryo) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
    if (conds.a0HighSpirits) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.char.skill).val as number).toBe(
        (off.compute(own.char.skill).val as number) + 1
      )
    }
  })
})
