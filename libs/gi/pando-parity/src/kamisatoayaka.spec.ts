/**
 * KamisatoAyaka WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds `afterSprint` / `afterSkillA1` / `afterApplySprint` / `afterBurst` /
 * `C6` — Pando `value: 1` ↔ WR state string (not `'on'`). C3 burst / C5 skill.
 * Sprint cryo infusion is listing-local. C4 defRed_ is enemyDebuff.
 *
 *   nx test gi-pando-parity -- kamisatoayaka.spec.ts
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
        key: 'KamisatoAyaka',
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
        location: 'KamisatoAyaka',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_bloom',
  'burst_cutting',
  'c2_bloom',
  'c2_cutting',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

const CRYO_LISTINGS = [
  'charged_cryo',
  'normal_0_cryo',
  'normal_1_cryo',
  'normal_2_cryo',
  'normal_3_cryo',
  'normal_4_cryo',
  'plunging_dmg_cryo',
  'plunging_high_cryo',
  'plunging_low_cryo',
]

function withConds(
  afterSprint: boolean,
  afterSkillA1: boolean,
  afterApplySprint: boolean,
  afterBurst: boolean,
  c6: boolean
): ParityFixture {
  const wrAyaka: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (afterSprint) {
    wrAyaka.afterSprint = 'afterSprint'
    pandoConditionals.push({
      sheet: 'KamisatoAyaka',
      src: '0',
      dst: null,
      name: 'afterSprint',
      value: 1,
    })
  }
  if (afterSkillA1) {
    wrAyaka.afterSkillA1 = 'afterSkill'
    pandoConditionals.push({
      sheet: 'KamisatoAyaka',
      src: '0',
      dst: null,
      name: 'afterSkillA1',
      value: 1,
    })
  }
  if (afterApplySprint) {
    wrAyaka.afterApplySprint = 'afterApplySprint'
    pandoConditionals.push({
      sheet: 'KamisatoAyaka',
      src: '0',
      dst: null,
      name: 'afterApplySprint',
      value: 1,
    })
  }
  if (afterBurst) {
    wrAyaka.afterBurst = 'c4'
    pandoConditionals.push({
      sheet: 'KamisatoAyaka',
      src: '0',
      dst: null,
      name: 'afterBurst',
      value: 1,
    })
  }
  if (c6) {
    wrAyaka.C6 = 'c6'
    pandoConditionals.push({
      sheet: 'KamisatoAyaka',
      src: '0',
      dst: null,
      name: 'C6',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { KamisatoAyaka: wrAyaka },
    pandoConditionals,
  }
}

describe('KamisatoAyaka WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false, false],
    [true, false, false, false, false],
    [false, true, false, false, false],
    [false, false, true, false, false],
    [false, false, false, true, false],
    [false, false, false, false, true],
    [true, true, true, true, true],
  ] as const)('aligned finals (sprint=%s a1=%s a4=%s c4=%s c6=%s)', (afterSprint, afterSkillA1, afterApplySprint, afterBurst, c6) => {
    const anyCond =
      afterSprint || afterSkillA1 || afterApplySprint || afterBurst || c6
    const fixture = anyCond
      ? withConds(afterSprint, afterSkillA1, afterApplySprint, afterBurst, c6)
      : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
    if (afterSprint) {
      expect(pandoListingNames(pando)).toEqual(
        expect.arrayContaining(CRYO_LISTINGS)
      )
    }
  })
})
