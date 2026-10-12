/**
 * Dehya WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `c2InField`. Num `c6CritStacks` 0–4. C3 burst / C5 skill.
 * C1 hp_ is ownBuff (always on at C6). C2 field dmg_ is listing-local.
 *
 *   nx test gi-pando-parity -- dehya.spec.ts
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
        key: 'Dehya',
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
        location: 'Dehya',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a4_dotHeal',
  'a4_initialHeal',
  'burst_drive',
  'burst_fist',
  'c4_heal',
  'charged_final',
  'charged_spin',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_field',
  'skill_indomitable',
  'skill_ranging',
]

function withConds(c2InField: boolean, c6CritStacks: number): ParityFixture {
  const wrDehya: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (c2InField) {
    wrDehya.c2InField = 'on'
    pandoConditionals.push({
      sheet: 'Dehya',
      src: '0',
      dst: null,
      name: 'c2InField',
      value: 1,
    })
  }
  if (c6CritStacks > 0) {
    wrDehya.c6CritStacks = String(c6CritStacks)
    pandoConditionals.push({
      sheet: 'Dehya',
      src: '0',
      dst: null,
      name: 'c6CritStacks',
      value: c6CritStacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Dehya: wrDehya },
    pandoConditionals,
  }
}

describe('Dehya WR ↔ Pando finals', () => {
  test.each([
    [false, 0],
    [true, 0],
    [false, 4],
    [true, 4],
  ] as const)('aligned finals (c2=%s c6=%s)', (c2InField, c6CritStacks) => {
    const fixture =
      c2InField || c6CritStacks ? withConds(c2InField, c6CritStacks) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const hp = pando.compute(own.final.hp).val as number
    expect(hp).toBeGreaterThan(0)
  })
})
