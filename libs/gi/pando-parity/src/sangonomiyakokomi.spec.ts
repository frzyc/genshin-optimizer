import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type ParityFixture,
  pandoListingNames,
  readPandoFinal,
  readWrFinal,
} from './harness'
import { relDiff } from './relDiff'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'SangonomiyaKokomi',
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
        location: 'SangonomiyaKokomi',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_heal',
  'c1',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_heal',
]

function withConds(
  burstOn: boolean,
  c2On: boolean,
  c6On: boolean
): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    SangonomiyaKokomi: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (burstOn) {
    wrConditionals.SangonomiyaKokomi.burst = 'on'
    pandoConditionals.push({
      sheet: 'SangonomiyaKokomi',
      src: '0',
      dst: null,
      name: 'burst',
      value: 1,
    })
  }
  if (c2On) {
    wrConditionals.SangonomiyaKokomi.c2 = 'on'
    pandoConditionals.push({
      sheet: 'SangonomiyaKokomi',
      src: '0',
      dst: null,
      name: 'c2',
      value: 1,
    })
  }
  if (c6On) {
    wrConditionals.SangonomiyaKokomi.c6 = 'on'
    pandoConditionals.push({
      sheet: 'SangonomiyaKokomi',
      src: '0',
      dst: null,
      name: 'c6',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('SangonomiyaKokomi WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [true, false, true],
    [false, true, false],
    [true, true, true],
  ] as const)('aligned finals (burst=%s c2=%s c6=%s)', (burstOn, c2On, c6On) => {
    const fixture = withConds(burstOn, c2On, c6On)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const wrCrit = readWrFinal(wr, 'critRate_')
    const pandoCrit = readPandoFinal(pando, 'critRate_')
    expect(relDiff(wrCrit, pandoCrit)).toBeLessThan(1e-4)
    expect(pandoCrit).toBeCloseTo(-0.95)
  })
})
