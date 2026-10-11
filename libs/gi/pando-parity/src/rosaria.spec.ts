/**
 * Rosaria WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * A4 is WR not-self teamBuff (total.critRate_); solo computeUIData does not apply it.
 *
 *   nx test gi-pando-parity -- rosaria.spec.ts
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
        key: 'Rosaria',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusLance',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Rosaria',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('Rosaria WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (RosariaA1=%s)', (a1) => {
    const fixture: ParityFixture = a1
      ? {
          ...FIXTURE,
          wrConditionals: { Rosaria: { RosariaA1: 'on' } },
          pandoConditionals: [
            {
              sheet: 'Rosaria',
              src: '0',
              dst: null,
              name: 'RosariaA1',
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
