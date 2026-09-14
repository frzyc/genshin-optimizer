/**
 * Albedo WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockHomework` / `lockCreateSolar` / `c1LockAfterSkill`. List
 * `burstUsed` / `p1EnemyHp` `'belowHp'` / `c2Stacks` `'1'`…`'4'`.
 * C3 skill / C5 burst. A4/C2 eleMas are teamBuff — skip `eleMas` when on.
 * lockC1 def_ is ownBuff.
 *
 *   nx test gi-pando-parity -- albedo.spec.ts
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
        key: 'Albedo',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusSword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Albedo',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_blossom',
  'charged_1',
  'charged_2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_blossom',
]

const C2_STACK4_LIST_INDEX = 4

function withConds(
  lockHomework: boolean,
  burstUsed: boolean,
  c1LockAfterSkill: boolean,
  c2Stack4: boolean
): ParityFixture {
  const wrAlbedo: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockHomework) {
    wrAlbedo.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Albedo',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (burstUsed) {
    wrAlbedo.burstUsed = 'burstUsed'
    pandoConditionals.push({
      sheet: 'Albedo',
      src: '0',
      dst: null,
      name: 'burstUsed',
      value: 1,
    })
  }
  if (c1LockAfterSkill) {
    wrAlbedo.c1LockAfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Albedo',
      src: '0',
      dst: null,
      name: 'c1LockAfterSkill',
      value: 1,
    })
  }
  if (c2Stack4) {
    wrAlbedo.c2Stacks = '4'
    pandoConditionals.push({
      sheet: 'Albedo',
      src: '0',
      dst: null,
      name: 'c2Stacks',
      value: C2_STACK4_LIST_INDEX,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Albedo: wrAlbedo },
    pandoConditionals,
  }
}

describe('Albedo WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false],
    [true, false, false, false],
    [false, true, false, false],
    [true, false, true, false],
    [true, true, true, true],
  ] as const)('aligned finals (homework=%s burstUsed=%s lockC1=%s c2=%s)', (lockHomework, burstUsed, c1LockAfterSkill, c2Stack4) => {
    const fixture =
      lockHomework || burstUsed || c1LockAfterSkill || c2Stack4
        ? withConds(lockHomework, burstUsed, c1LockAfterSkill, c2Stack4)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    const skipEleMas = burstUsed || (lockHomework && c2Stack4)
    assertFinals(
      wr,
      pando,
      skipEleMas ? DEFAULT_FINALS.filter((s) => s !== 'eleMas') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (lockHomework && c1LockAfterSkill) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.def).val as number).toBeGreaterThan(
        off.compute(own.final.def).val as number
      )
    }
  })
})
