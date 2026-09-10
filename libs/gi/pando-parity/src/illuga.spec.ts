/**
 * Illuga WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * burstSong / A4 Nightingale dmgInc are dest-gated teamBuff formula.base
 * (geo / lunarcrystallize) — not in DEFAULT_FINALS.
 * a1AfterSkillBurst is notOwnBuff (WR unequal self); gleam needs moonsign >= 2.
 * c4BurstActive is destIsActive teamBuff def. Solo computeUIData does not apply
 * WR teamBuff; Pando teamBuff does. C4 on: assertFinals skips `def`.
 *
 *   nx test gi-pando-parity -- illuga.spec.ts
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
        key: 'Illuga',
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
        location: 'Illuga',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a4Song_geo_dmgInc',
  'a4Song_lunarcrystallize_dmgInc',
  'burst',
  'burstSong_geo_dmgInc',
  'burstSong_lunarcrystallize_dmgInc',
  'c2',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_hold',
  'skill_press',
]

function withConds(
  burstSong: boolean,
  a1AfterSkillBurst: boolean,
  c4BurstActive: boolean
): ParityFixture {
  const wrIlluga: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (burstSong) {
    wrIlluga.burstSong = 'on'
    pandoConditionals.push({
      sheet: 'Illuga',
      src: '0',
      dst: null,
      name: 'burstSong',
      value: 1,
    })
  }
  if (a1AfterSkillBurst) {
    wrIlluga.a1AfterSkillBurst = 'on'
    pandoConditionals.push({
      sheet: 'Illuga',
      src: '0',
      dst: null,
      name: 'a1AfterSkillBurst',
      value: 1,
    })
  }
  if (c4BurstActive) {
    wrIlluga.c4BurstActive = 'on'
    pandoConditionals.push({
      sheet: 'Illuga',
      src: '0',
      dst: null,
      name: 'c4BurstActive',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Illuga: wrIlluga },
    pandoConditionals,
  }
}

describe('Illuga WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (burstSong=%s a1AfterSkillBurst=%s c4BurstActive=%s)', (burstSong, a1AfterSkillBurst, c4BurstActive) => {
    const fixture =
      burstSong || a1AfterSkillBurst || c4BurstActive
        ? withConds(burstSong, a1AfterSkillBurst, c4BurstActive)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.def is hidden in solo UIData; Pando destIsActive applies it.
    assertFinals(
      wr,
      pando,
      c4BurstActive ? DEFAULT_FINALS.filter((s) => s !== 'def') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of EXPECTED_LISTINGS) {
      expect(names, name).toContain(name)
    }

    if (c4BurstActive) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.def).val as number).toBeCloseTo(
        (off.compute(own.final.def).val as number) + 200
      )
    }
  })
})
