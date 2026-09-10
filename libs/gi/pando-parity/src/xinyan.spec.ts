/**
 * Xinyan WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * c6Charged writes ownBuff.premod.atk from DEF.
 *
 *   nx test gi-pando-parity -- xinyan.spec.ts
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
        key: 'Xinyan',
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
        location: 'Xinyan',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('Xinyan WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (c6Charged=%s)', (c6Charged) => {
    const fixture: ParityFixture = c6Charged
      ? {
          ...FIXTURE,
          wrConditionals: { Xinyan: { c6Charged: 'on' } },
          pandoConditionals: [
            {
              sheet: 'Xinyan',
              src: '0',
              dst: null,
              name: 'c6Charged',
              value: 1,
            },
          ],
        }
      : FIXTURE

    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })
})
