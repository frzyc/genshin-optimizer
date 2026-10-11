/**
 * Skirk WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `c2AfterBurst` `'on'`. Num `a4DeathStacks` 0–3 / `burstSerpentOver`
 * 0–22 (13–22 C2-gated). List `burstVoidAbsorb` `['0','1','2','3']` — Pando
 * `value` is 1-based (WR `'3'` → 4). C3 burst / C5 skill.
 * Skill-state NA/CA/plunge are listing-local cryo (no cryo infusionPrio).
 * C2 atk_ is ownBuff; inverted on auto/burst listings via formula.base.
 * A0 skillBoost is teamBuff.char.skill (solo hydro=0 → off).
 *
 *   nx test gi-pando-parity -- skirk.spec.ts
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
        key: 'Skirk',
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
        location: 'Skirk',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_finalDmg',
  'burst_skillDmg',
  'c1',
  'c6_burst',
  'c6_charged',
  'c6_normal',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_0',
  'skill_1',
  'skill_2',
  'skill_3',
  'skill_4',
  'skill_chargedDmg',
  'skill_plunging_dmg',
  'skill_plunging_high',
  'skill_plunging_low',
]

/** WR `'3'` — 1-based index into `['0','1','2','3']`. */
const VOID_ABSORB_3_LIST_INDEX = 4

function withConds(
  a4DeathStacks: number,
  c2AfterBurst: boolean,
  burstSerpentOver: number,
  burstVoidAbsorb3: boolean
): ParityFixture {
  const wrSkirk: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4DeathStacks > 0) {
    wrSkirk.a4DeathStacks = String(a4DeathStacks)
    pandoConditionals.push({
      sheet: 'Skirk',
      src: '0',
      dst: null,
      name: 'a4DeathStacks',
      value: a4DeathStacks,
    })
  }
  if (c2AfterBurst) {
    wrSkirk.c2AfterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Skirk',
      src: '0',
      dst: null,
      name: 'c2AfterBurst',
      value: 1,
    })
  }
  if (burstSerpentOver > 0) {
    wrSkirk.burstSerpentOver = String(burstSerpentOver)
    pandoConditionals.push({
      sheet: 'Skirk',
      src: '0',
      dst: null,
      name: 'burstSerpentOver',
      value: burstSerpentOver,
    })
  }
  if (burstVoidAbsorb3) {
    wrSkirk.burstVoidAbsorb = '3'
    pandoConditionals.push({
      sheet: 'Skirk',
      src: '0',
      dst: null,
      name: 'burstVoidAbsorb',
      value: VOID_ABSORB_3_LIST_INDEX,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Skirk: wrSkirk },
    pandoConditionals,
  }
}

describe('Skirk WR ↔ Pando finals', () => {
  test.each([
    [0, false, 0, false],
    [3, false, 0, false],
    [0, true, 0, false],
    [0, false, 22, false],
    [0, false, 0, true],
    [3, true, 22, true],
  ] as const)('aligned finals (a4=%s c2=%s serpent=%s void3=%s)', (a4DeathStacks, c2AfterBurst, burstSerpentOver, burstVoidAbsorb3) => {
    const fixture =
      a4DeathStacks || c2AfterBurst || burstSerpentOver || burstVoidAbsorb3
        ? withConds(
            a4DeathStacks,
            c2AfterBurst,
            burstSerpentOver,
            burstVoidAbsorb3
          )
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (a4DeathStacks || c2AfterBurst) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
