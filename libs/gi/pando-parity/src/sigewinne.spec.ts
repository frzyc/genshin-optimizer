/**
 * Sigewinne WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `a1BedRest` / `a1Conva` / `c2AfterHit` / `c6AfterHeal` are `'on'`.
 * List `skillTier` `['1','2']` — Pando `value` is 1-based (WR `'2'` → 2).
 * List `a4TeamBond` `['1000',…,'10000']` — Pando `value` is 1-based (WR `'10000'` → 10).
 * C3 skill / C5 burst. a1Conva skill_dmgInc is WR teamBuff (not in DEFAULT_FINALS).
 * c2 hydro RES is enemyDebuff. C6 burst crit is move-scoped (not DEFAULT_FINALS).
 *
 *   nx test gi-pando-parity -- sigewinne.spec.ts
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
        key: 'Sigewinne',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusWarbow',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Sigewinne',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1Conva_skill_dmgInc',
  'burst',
  'c2_hydroShield',
  'c2_shield',
  'c6AfterHeal_burst_critDMG_',
  'c6AfterHeal_burst_critRate_',
  'charged_aimed',
  'charged_aimedCharged',
  'charged_bubble',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_bladeDmg',
  'skill_selfHeal',
  'skill_teammateHeal',
]

/** WR `'2'` — 1-based index into `['1','2']`. */
const SKILL_TIER_2_LIST_INDEX = 2
/** WR `'10000'` — 1-based index into `['1000',…,'10000']`. */
const A4_TEAM_BOND_10000_LIST_INDEX = 10

function withConds(
  skillTier: boolean,
  a1BedRest: boolean,
  a1Conva: boolean,
  a4TeamBond: boolean,
  c2AfterHit: boolean,
  c6AfterHeal: boolean
): ParityFixture {
  const wrSigewinne: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillTier) {
    wrSigewinne.skillTier = '2'
    pandoConditionals.push({
      sheet: 'Sigewinne',
      src: '0',
      dst: null,
      name: 'skillTier',
      value: SKILL_TIER_2_LIST_INDEX,
    })
  }
  if (a1BedRest) {
    wrSigewinne.a1BedRest = 'on'
    pandoConditionals.push({
      sheet: 'Sigewinne',
      src: '0',
      dst: null,
      name: 'a1BedRest',
      value: 1,
    })
  }
  if (a1Conva) {
    wrSigewinne.a1Conva = 'on'
    pandoConditionals.push({
      sheet: 'Sigewinne',
      src: '0',
      dst: null,
      name: 'a1Conva',
      value: 1,
    })
  }
  if (a4TeamBond) {
    wrSigewinne.a4TeamBond = '10000'
    pandoConditionals.push({
      sheet: 'Sigewinne',
      src: '0',
      dst: null,
      name: 'a4TeamBond',
      value: A4_TEAM_BOND_10000_LIST_INDEX,
    })
  }
  if (c2AfterHit) {
    wrSigewinne.c2AfterHit = 'on'
    pandoConditionals.push({
      sheet: 'Sigewinne',
      src: '0',
      dst: null,
      name: 'c2AfterHit',
      value: 1,
    })
  }
  if (c6AfterHeal) {
    wrSigewinne.c6AfterHeal = 'on'
    pandoConditionals.push({
      sheet: 'Sigewinne',
      src: '0',
      dst: null,
      name: 'c6AfterHeal',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Sigewinne: wrSigewinne },
    pandoConditionals,
  }
}

describe('Sigewinne WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false, false, false],
    [true, false, false, false, false, false],
    [false, true, false, false, false, false],
    [false, false, true, false, false, false],
    [false, false, false, true, false, false],
    [false, false, false, false, true, false],
    [false, false, false, false, false, true],
    [true, true, true, true, true, true],
  ] as const)('aligned finals (skillTier=%s a1BedRest=%s a1Conva=%s a4TeamBond=%s c2AfterHit=%s c6AfterHeal=%s)', (skillTier, a1BedRest, a1Conva, a4TeamBond, c2AfterHit, c6AfterHeal) => {
    const fixture =
      skillTier ||
      a1BedRest ||
      a1Conva ||
      a4TeamBond ||
      c2AfterHit ||
      c6AfterHeal
        ? withConds(
            skillTier,
            a1BedRest,
            a1Conva,
            a4TeamBond,
            c2AfterHit,
            c6AfterHeal
          )
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
