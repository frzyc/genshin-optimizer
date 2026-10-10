/**
 * Barbara WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 *   nx test gi-pando-parity -- barbara.spec.ts
 */
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type ParityFixture,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Barbara',
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
        location: 'Barbara',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('Barbara WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [true, true],
  ] as const)('aligned finals (skill=%s c2=%s)', (skillOn, c2On) => {
    const pandoConditionals = [
      ...(skillOn
        ? [
            {
              sheet: 'Barbara' as const,
              src: '0' as const,
              dst: null,
              name: 'skill',
              value: 1,
            },
          ]
        : []),
      ...(c2On
        ? [
            {
              sheet: 'Barbara' as const,
              src: '0' as const,
              dst: null,
              name: 'c2',
              value: 1,
            },
          ]
        : []),
    ]
    const fixture: ParityFixture =
      skillOn || c2On
        ? {
            ...FIXTURE,
            wrConditionals: {
              Barbara: {
                ...(skillOn ? { skill: 'on' } : {}),
                ...(c2On ? { c2: 'on' } : {}),
              },
            },
            pandoConditionals,
          }
        : FIXTURE

    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })
})
