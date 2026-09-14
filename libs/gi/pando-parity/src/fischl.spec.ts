/**
 * Fischl WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * lockOverload atk_ needs hexerei >= 2 (WR tally overlay + extra Pando tally).
 *
 *   nx test gi-pando-parity -- fischl.spec.ts
 */
import { hexereiTally, withMember } from '@genshin-optimizer/gi/formula'
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
        key: 'Fischl',
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
        location: 'Fischl',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withLockOverload(lockOverload: boolean): ParityFixture {
  return {
    ...FIXTURE,
    wrTally: { hexerei: 2 },
    extraPando: withMember('0', hexereiTally(1)),
    wrConditionals: {
      Fischl: {
        lockHomework: 'on',
        ...(lockOverload ? { lockOverload: 'on' } : {}),
      },
    },
    pandoConditionals: [
      {
        sheet: 'Fischl',
        src: '0',
        dst: null,
        name: 'lockHomework',
        value: 1,
      },
      ...(lockOverload
        ? [
            {
              sheet: 'Fischl' as const,
              src: '0' as const,
              dst: null,
              name: 'lockOverload',
              value: 1,
            },
          ]
        : []),
    ],
  }
}

describe('Fischl WR ↔ Pando finals', () => {
  test.each([
    false,
    true,
  ])('aligned finals (lockOverload=%s)', (lockOverload) => {
    const fixture = withLockOverload(lockOverload)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })
})
