/**
 * Kaeya WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 *   nx test gi-pando-parity -- kaeya.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { expect } from 'vitest'
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
        key: 'Kaeya',
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
        location: 'Kaeya',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('Kaeya WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (CryoC1=%s)', (cryoC1) => {
    const fixture: ParityFixture = cryoC1
      ? {
          ...FIXTURE,
          wrConditionals: { Kaeya: { CryoC1: 'on' } },
          pandoConditionals: [
            {
              sheet: 'Kaeya',
              src: '0',
              dst: null,
              name: 'CryoC1',
              value: 1,
            },
          ],
        }
      : FIXTURE

    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const globalCr = pando.compute(own.final.critRate_).val as number
    const normalCr = pando.compute(own.final.critRate_.normal).val as number
    const chargedCr = pando.compute(own.final.critRate_.charged).val as number
    expect(normalCr - globalCr).toBeCloseTo(cryoC1 ? 0.15 : 0)
    expect(chargedCr - globalCr).toBeCloseTo(cryoC1 ? 0.15 : 0)
  })
})
