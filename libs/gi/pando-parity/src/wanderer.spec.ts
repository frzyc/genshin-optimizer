/**
 * Wanderer WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `afterSkill` `'on'`. List `skillPyroContact` `['pyro']` / `skillCryoContact`
 * `['cryo']` — Pando `value: 1` ↔ WR `'pyro'` / `'cryo'`. List `c2Points`
 * `['5','10',…,'50']` — Pando `value` is 1-based (WR `'50'` → 10).
 * C3 burst / C5 skill. Catalyst NA/CA/plunge are already Anemo; WR does not infuse.
 *
 *   nx test gi-pando-parity -- wanderer.spec.ts
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
        key: 'Wanderer',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusCodex',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Wanderer',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'passive2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

/** WR `'50'` — 1-based index into `['5','10',…,'50']`. */
const C2_POINTS_50_LIST_INDEX = 10

function withConds(
  afterSkill: boolean,
  skillPyroContact: boolean,
  skillCryoContact: boolean,
  c2Points50: boolean
): ParityFixture {
  const wrWanderer: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (afterSkill) {
    wrWanderer.afterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Wanderer',
      src: '0',
      dst: null,
      name: 'afterSkill',
      value: 1,
    })
  }
  if (skillPyroContact) {
    wrWanderer.skillPyroContact = 'pyro'
    pandoConditionals.push({
      sheet: 'Wanderer',
      src: '0',
      dst: null,
      name: 'skillPyroContact',
      value: 1,
    })
  }
  if (skillCryoContact) {
    wrWanderer.skillCryoContact = 'cryo'
    pandoConditionals.push({
      sheet: 'Wanderer',
      src: '0',
      dst: null,
      name: 'skillCryoContact',
      value: 1,
    })
  }
  if (c2Points50) {
    wrWanderer.c2Points = '50'
    pandoConditionals.push({
      sheet: 'Wanderer',
      src: '0',
      dst: null,
      name: 'c2Points',
      value: C2_POINTS_50_LIST_INDEX,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Wanderer: wrWanderer },
    pandoConditionals,
  }
}

describe('Wanderer WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false],
    [true, false, false, false],
    [true, true, false, false],
    [true, false, true, false],
    [true, false, false, true],
    [true, true, true, true],
  ] as const)('aligned finals (afterSkill=%s pyro=%s cryo=%s c2=%s)', (afterSkill, skillPyroContact, skillCryoContact, c2Points50) => {
    const fixture =
      afterSkill || skillPyroContact || skillCryoContact || c2Points50
        ? withConds(afterSkill, skillPyroContact, skillCryoContact, c2Points50)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (afterSkill && skillPyroContact) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
    if (afterSkill && skillCryoContact) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critRate_).val as number).toBeGreaterThan(
        off.compute(own.final.critRate_).val as number
      )
    }
  })
})
