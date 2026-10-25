/**
 * Amber WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * C6 is WR teamBuff (atk_/moveSPD_); solo computeUIData does not apply it.
 *
 *   nx test gi-pando-parity
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
        key: 'Amber',
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
        location: 'Amber',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('Amber WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (A4=%s)', (a4) => {
    const fixture: ParityFixture = a4
      ? {
          ...FIXTURE,
          wrConditionals: { Amber: { A4: 'on' } },
          pandoConditionals: [
            {
              sheet: 'Amber',
              src: '0',
              dst: null,
              name: 'A4',
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
