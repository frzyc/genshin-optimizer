/**
 * Kinich WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 *   nx test gi-pando-parity -- kinich.spec.ts
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
        key: 'Kinich',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusGreatsword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Kinich',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_laser',
  'c6',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_cannon',
  'skill_shot',
]

function withConds(
  a4Stacks: number,
  c2Hit: boolean,
  c2FirstHit: boolean
): ParityFixture {
  const wrKinich: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4Stacks) {
    wrKinich.a4Stacks = String(a4Stacks)
    pandoConditionals.push({
      sheet: 'Kinich',
      src: '0',
      dst: null,
      name: 'a4Stacks',
      value: a4Stacks,
    })
  }
  if (c2Hit) {
    wrKinich.c2Hit = 'on'
    pandoConditionals.push({
      sheet: 'Kinich',
      src: '0',
      dst: null,
      name: 'c2Hit',
      value: 1,
    })
  }
  if (c2FirstHit) {
    wrKinich.c2FirstHit = 'on'
    pandoConditionals.push({
      sheet: 'Kinich',
      src: '0',
      dst: null,
      name: 'c2FirstHit',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Kinich: wrKinich },
    pandoConditionals,
  }
}

describe('Kinich WR ↔ Pando finals', () => {
  test.each([
    [0, false, false],
    [2, false, false],
    [0, true, true],
  ] as const)('aligned finals (a4=%s c2Hit=%s c2First=%s)', (a4, c2Hit, c2First) => {
    const fixture =
      a4 || c2Hit || c2First ? withConds(a4, c2Hit, c2First) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
