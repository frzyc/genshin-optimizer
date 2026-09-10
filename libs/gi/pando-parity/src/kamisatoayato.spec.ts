/**
 * KamisatoAyato WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `burstInArea` / `c1OppHp` / `c4AfterBurst`. Num `skillStacks` 0–5
 * (WR lookup keys `'1'`…`'5'`; 5th stack C2-gated). C3 skill / C5 burst.
 * C2 hp_ is ownBuff at stacks ≥ 3. Burst NA dmg_ is dest-gated teamBuff;
 * C4 atkSPD_ is whole-party teamBuff. Solo computeUIData does not apply WR
 * teamBuff; those stats are not in DEFAULT_FINALS.
 *
 * Shunsuiken is listing-local hydro customDmg (skill MV, move normal) — not
 * infusionPrio. Namisen / C1 are name-scoped extras.
 *
 *   nx test gi-pando-parity -- kamisatoayato.spec.ts
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
        key: 'KamisatoAyato',
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
        location: 'KamisatoAyato',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c6',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_dmg0',
  'skill_dmg1',
  'skill_dmg2',
  'skill_illusionDmg',
]

const C2_HP_ = 0.5
const C4_ATKSPD_ = 0.15

function withConds(
  skillStacks: number,
  burstInArea: boolean,
  c1OppHp: boolean,
  c4AfterBurst: boolean
): ParityFixture {
  const wrAyato: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillStacks > 0) {
    wrAyato.skillStacks = String(skillStacks)
    pandoConditionals.push({
      sheet: 'KamisatoAyato',
      src: '0',
      dst: null,
      name: 'skillStacks',
      value: skillStacks,
    })
  }
  if (burstInArea) {
    wrAyato.burstInArea = 'on'
    pandoConditionals.push({
      sheet: 'KamisatoAyato',
      src: '0',
      dst: null,
      name: 'burstInArea',
      value: 1,
    })
  }
  if (c1OppHp) {
    wrAyato.c1OppHp = 'on'
    pandoConditionals.push({
      sheet: 'KamisatoAyato',
      src: '0',
      dst: null,
      name: 'c1OppHp',
      value: 1,
    })
  }
  if (c4AfterBurst) {
    wrAyato.c4AfterBurst = 'on'
    pandoConditionals.push({
      sheet: 'KamisatoAyato',
      src: '0',
      dst: null,
      name: 'c4AfterBurst',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { KamisatoAyato: wrAyato },
    pandoConditionals,
  }
}

describe('KamisatoAyato WR ↔ Pando finals', () => {
  test.each([
    [0, false, false, false],
    [2, false, false, false],
    [5, false, false, false],
    [0, true, false, false],
    [0, false, true, false],
    [0, false, false, true],
    [5, true, true, true],
  ] as const)('aligned finals (skillStacks=%s burstInArea=%s c1OppHp=%s c4AfterBurst=%s)', (skillStacks, burstInArea, c1OppHp, c4AfterBurst) => {
    const fixture =
      skillStacks || burstInArea || c1OppHp || c4AfterBurst
        ? withConds(skillStacks, burstInArea, c1OppHp, c4AfterBurst)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (skillStacks >= 3) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.premod.hp_).val as number).toBeCloseTo(C2_HP_)
      expect(pando.compute(own.final.hp).val as number).toBeGreaterThan(
        off.compute(own.final.hp).val as number
      )
    }

    const pandoAtkSpd = pando.compute(own.final.atkSPD_).val as number
    expect(pandoAtkSpd).toBeCloseTo(c4AfterBurst ? C4_ATKSPD_ : 0)
  })
})
