/**
 * Somnia WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `superposition` / `cycloneActive` / `multiplication` / `subtraction` /
 * `lessThan3` / `c2Prime` are `'on'`. Num `a4EnemiesHit` 1..stacks and
 * `c6Stacks` 1..max (not `'on'`). List `c1Mode` `'average'` | `'always'` —
 * Pando `value` 1 / 2. C3 burst / C5 skill.
 * Team electro infusion is listing-local (infusionPrio has no electro);
 * catalyst self listings stay hidden.
 *
 *   nx test gi-pando-parity -- somnia.spec.ts
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
        key: 'Somnia',
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
        location: 'Somnia',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_addDot',
  'burst_initial',
  'burst_multDot',
  'burst_subDot',
  'burst_sunder',
  'burst_supernova',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

type SomniaConds = {
  superposition?: boolean
  cycloneActive?: boolean
  multiplication?: boolean
  subtraction?: boolean
  lessThan3?: boolean
  a4EnemiesHit?: number
  c1Mode?: 'average' | 'always'
  c2Prime?: boolean
  c6Stacks?: number
}

function withConds(conds: SomniaConds): ParityFixture {
  const wrSomnia: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  for (const name of [
    'superposition',
    'cycloneActive',
    'multiplication',
    'subtraction',
    'lessThan3',
    'c2Prime',
  ] as const) {
    if (!conds[name]) continue
    wrSomnia[name] = 'on'
    pandoConditionals.push({
      sheet: 'Somnia',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  if (conds.a4EnemiesHit) {
    wrSomnia.a4EnemiesHit = String(conds.a4EnemiesHit)
    pandoConditionals.push({
      sheet: 'Somnia',
      src: '0',
      dst: null,
      name: 'a4EnemiesHit',
      value: conds.a4EnemiesHit,
    })
  }
  if (conds.c1Mode) {
    wrSomnia.c1Mode = conds.c1Mode
    pandoConditionals.push({
      sheet: 'Somnia',
      src: '0',
      dst: null,
      name: 'c1Mode',
      value: conds.c1Mode === 'average' ? 1 : 2,
    })
  }
  if (conds.c6Stacks) {
    wrSomnia.c6Stacks = String(conds.c6Stacks)
    pandoConditionals.push({
      sheet: 'Somnia',
      src: '0',
      dst: null,
      name: 'c6Stacks',
      value: conds.c6Stacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Somnia: wrSomnia },
    pandoConditionals,
  }
}

describe('Somnia WR ↔ Pando finals', () => {
  test.each([
    {},
    { superposition: true },
    { cycloneActive: true, a4EnemiesHit: 5 },
    { cycloneActive: true, multiplication: true },
    { cycloneActive: true, subtraction: true },
    { lessThan3: true },
    { c1Mode: 'average' as const },
    { c1Mode: 'always' as const },
    { superposition: true, c2Prime: true },
    { c6Stacks: 8 },
    {
      superposition: true,
      cycloneActive: true,
      multiplication: true,
      subtraction: true,
      lessThan3: true,
      a4EnemiesHit: 5,
      c1Mode: 'always' as const,
      c2Prime: true,
      c6Stacks: 8,
    },
  ])('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (conds.c6Stacks) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critRate_).val as number).toBeGreaterThan(
        off.compute(own.final.critRate_).val as number
      )
      expect(pando.compute(own.final.critDMG_).val as number).toBeGreaterThan(
        off.compute(own.final.critDMG_).val as number
      )
    }
    if (conds.cycloneActive) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
    }
  })
})
