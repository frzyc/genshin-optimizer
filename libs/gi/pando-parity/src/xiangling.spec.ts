/**
 * Xiangling WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * afterChili / afterPyronado are WR teamBuff; solo computeUIData does not apply them.
 * afterChili is still toggled so Pando atk_ can be probed.
 *
 *   nx test gi-pando-parity -- xiangling.spec.ts
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
        key: 'Xiangling',
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
        location: 'Xiangling',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

describe('Xiangling WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (afterChili=%s)', (afterChili) => {
    const fixture: ParityFixture = afterChili
      ? {
          ...FIXTURE,
          wrConditionals: { Xiangling: { afterChili: 'on' } },
          pandoConditionals: [
            {
              sheet: 'Xiangling',
              src: '0',
              dst: null,
              name: 'afterChili',
              value: 1,
            },
          ],
        }
      : FIXTURE

    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff atk_ is hidden in solo UIData; skip atk when chili is on.
    assertFinals(
      wr,
      pando,
      afterChili
        ? ['hp', 'def', 'eleMas', 'critRate_', 'critDMG_', 'enerRech_']
        : undefined
    )
    assertPandoListingsFinite(pando)

    const pandoAtk_ = pando.compute(own.premod.atk_).val as number
    expect(pandoAtk_).toBeCloseTo(afterChili ? 0.1 : 0)
  })
})
