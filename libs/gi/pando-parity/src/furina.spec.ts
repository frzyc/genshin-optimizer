/**
 * Furina WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `skillHpConsumeStacks` 1–4, `burstFanfare` 50-step (cap 300, C1 400),
 * `c2Overstack` 50-step to 400. Bools `c6` / `c6Pneuma` are `'on'`.
 * C3 burst / C5 skill. Fanfare all_dmg_ / incHeal_ are WR teamBuff — solo
 * computeUIData hides them; they are not in DEFAULT_FINALS so atk/hp still
 * compare. C2 overstack hp_ is ownBuff (condTem is teamBuff UI only).
 *
 *   nx test gi-pando-parity -- furina.spec.ts
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
        key: 'Furina',
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
        location: 'Furina',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_heal',
  'a4_healInterval',
  'a4_member_dmg_',
  'burst_skillDmg',
  'c6_heal',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_bubbleDmg',
  'skill_chevalDmg',
  'skill_crabDmg',
  'skill_streamsHeal',
  'skill_usherDmg',
  'thornBladeDmg',
]

const C2_HP_PER_STACK = 0.0035

function withConds(
  skillHpConsumeStacks: number,
  burstFanfare: number,
  c2Overstack: number,
  c6: boolean,
  c6Pneuma: boolean
): ParityFixture {
  const wrFurina: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillHpConsumeStacks > 0) {
    wrFurina.skillHpConsumeStacks = String(skillHpConsumeStacks)
    pandoConditionals.push({
      sheet: 'Furina',
      src: '0',
      dst: null,
      name: 'skillHpConsumeStacks',
      value: skillHpConsumeStacks,
    })
  }
  if (burstFanfare > 0) {
    wrFurina.burstFanfare = String(burstFanfare)
    pandoConditionals.push({
      sheet: 'Furina',
      src: '0',
      dst: null,
      name: 'burstFanfare',
      value: burstFanfare,
    })
  }
  if (c2Overstack > 0) {
    wrFurina.c2Overstack = String(c2Overstack)
    pandoConditionals.push({
      sheet: 'Furina',
      src: '0',
      dst: null,
      name: 'c2Overstack',
      value: c2Overstack,
    })
  }
  if (c6) {
    wrFurina.c6 = 'on'
    pandoConditionals.push({
      sheet: 'Furina',
      src: '0',
      dst: null,
      name: 'c6',
      value: 1,
    })
  }
  if (c6Pneuma) {
    wrFurina.c6Pneuma = 'on'
    pandoConditionals.push({
      sheet: 'Furina',
      src: '0',
      dst: null,
      name: 'c6Pneuma',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Furina: wrFurina },
    pandoConditionals,
  }
}

describe('Furina WR ↔ Pando finals', () => {
  test.each([
    [0, 0, 0, false, false],
    [4, 0, 0, false, false],
    [0, 300, 0, false, false],
    [0, 400, 0, false, false],
    [0, 0, 400, false, false],
    [0, 0, 0, true, false],
    [0, 0, 0, true, true],
    [4, 400, 400, true, true],
  ] as const)('aligned finals (skillHpConsumeStacks=%s burstFanfare=%s c2Overstack=%s c6=%s c6Pneuma=%s)', (skillHpConsumeStacks, burstFanfare, c2Overstack, c6, c6Pneuma) => {
    const fixture =
      skillHpConsumeStacks || burstFanfare || c2Overstack || c6 || c6Pneuma
        ? withConds(
            skillHpConsumeStacks,
            burstFanfare,
            c2Overstack,
            c6,
            c6Pneuma
          )
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // Fanfare teamBuff dmg_/incHeal_ are hidden in solo WR UIData and are
    // not in DEFAULT_FINALS. C2 hp_ is own, so hp still compares.
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c2Overstack) {
      expect(pando.compute(own.premod.hp_).val as number).toBeCloseTo(
        c2Overstack * C2_HP_PER_STACK
      )
    }
  })
})
