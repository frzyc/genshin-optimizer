/**
 * Lisa WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 *   nx test gi-pando-parity -- lisa.spec.ts
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
        key: 'Lisa',
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
        location: 'Lisa',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withConds(lisaC2: boolean, lisaA4: boolean): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Lisa: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lisaC2) {
    wrConditionals.Lisa.LisaC2 = 'on'
    pandoConditionals.push({
      sheet: 'Lisa',
      src: '0',
      dst: null,
      name: 'LisaC2',
      value: 1,
    })
  }
  if (lisaA4) {
    wrConditionals.Lisa.LisaA4 = 'on'
    pandoConditionals.push({
      sheet: 'Lisa',
      src: '0',
      dst: null,
      name: 'LisaA4',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Lisa WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (LisaC2=%s LisaA4=%s)', (lisaC2, lisaA4) => {
    const fixture = withConds(lisaC2, lisaA4)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })
})
