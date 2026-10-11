/**
 * Xingqiu WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * C2 is enemy hydro RES (may not move DEFAULT_FINALS). A4 hydro DMG is always-on at A6.
 * skill dmgRed_ has no Pando tag (customParam only).
 *
 *   nx test gi-pando-parity -- xingqiu.spec.ts
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
        key: 'Xingqiu',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusSword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Xingqiu',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('Xingqiu WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (c2=%s)', (c2On) => {
    const fixture: ParityFixture = c2On
      ? {
          ...FIXTURE,
          wrConditionals: { Xingqiu: { c2: 'on' } },
          pandoConditionals: [
            {
              sheet: 'Xingqiu',
              src: '0',
              dst: null,
              name: 'c2',
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
