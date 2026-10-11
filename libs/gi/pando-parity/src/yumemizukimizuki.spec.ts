/**
 * Yumemizuki Mizuki WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * C6 critRate_/critDMG_ need lockRevelation. Hexerei overlay like Fischl
 * (WR tally overlay + extra Pando tally) when lockRevelation is on.
 * skillDream lockDream_eleMas is WR teamBuff.total.eleMas; solo
 * computeUIData does not apply it.
 *
 *   nx test gi-pando-parity -- yumemizukimizuki.spec.ts
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
        key: 'YumemizukiMizuki',
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
        location: 'YumemizukiMizuki',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withLockRevelation(a4Phec: boolean): ParityFixture {
  return {
    ...FIXTURE,
    wrTally: { hexerei: 2 },
    extraPando: withMember('0', hexereiTally(1)),
    wrConditionals: {
      YumemizukiMizuki: {
        lockRevelation: 'on',
        ...(a4Phec ? { a4Phec: 'on' } : {}),
      },
    },
    pandoConditionals: [
      {
        sheet: 'YumemizukiMizuki',
        src: '0',
        dst: null,
        name: 'lockRevelation',
        value: 1,
      },
      ...(a4Phec
        ? [
            {
              sheet: 'YumemizukiMizuki' as const,
              src: '0' as const,
              dst: null,
              name: 'a4Phec',
              value: 1,
            },
          ]
        : []),
    ],
  }
}

describe('Yumemizuki Mizuki WR ↔ Pando finals', () => {
  test.each([
    false,
    true,
  ])('aligned finals (lockRevelation overlay, a4Phec=%s)', (a4Phec) => {
    const fixture = withLockRevelation(a4Phec)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })

  test('aligned finals (no hexerei)', () => {
    const wr = buildWrSolo(FIXTURE)
    const pando = buildPando(FIXTURE)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })
})
