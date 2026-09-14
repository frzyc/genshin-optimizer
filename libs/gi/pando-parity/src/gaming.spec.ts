/**
 * Gaming WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * a4HpState list: Pando value 1 = WR 'below', 2 = WR 'above' (0 = unset).
 * A4 below is ownBuff heal_ (not in DEFAULT_FINALS); A4 above is listing-local.
 * C2 is ownBuff atk_ (solo computeUIData applies it).
 *
 *   nx test gi-pando-parity -- gaming.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { input } from '@genshin-optimizer/gi/wr'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type ParityFixture,
} from './harness'
import { relDiff } from './relDiff'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Gaming',
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
        location: 'Gaming',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

type A4HpState = 'below' | 'above'

function withConds(a4?: A4HpState, c2 = false): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Gaming: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4) {
    wrConditionals.Gaming.a4HpState = a4
    pandoConditionals.push({
      sheet: 'Gaming',
      src: '0',
      dst: null,
      name: 'a4HpState',
      value: a4 === 'below' ? 1 : 2,
    })
  }
  if (c2) {
    wrConditionals.Gaming.c2Overheal = 'on'
    pandoConditionals.push({
      sheet: 'Gaming',
      src: '0',
      dst: null,
      name: 'c2Overheal',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Gaming WR ↔ Pando finals', () => {
  test.each([
    [undefined, false],
    ['below', false],
    ['above', false],
    [undefined, true],
    ['below', true],
    ['above', true],
  ] as const)('aligned finals (a4HpState=%s c2Overheal=%s)', (a4, c2) => {
    const fixture = withConds(a4, c2)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const wrHeal = wr.get(input.total.heal_).value as number
    const pandoHeal = pando.compute(own.final.heal_).val as number
    expect(relDiff(wrHeal, pandoHeal)).toBeLessThan(1e-4)
    expect(pandoHeal).toBeCloseTo(a4 === 'below' ? 0.2 : 0)
  })
})
