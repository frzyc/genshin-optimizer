/**
 * KukiShinobu WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * underHP is own heal_ (not in DEFAULT_FINALS); c6Trigger is own eleMas.
 * A4 healInc is folded into ringHeal base (no healInc tag).
 *
 *   nx test gi-pando-parity -- kukishinobu.spec.ts
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
        key: 'KukiShinobu',
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
        location: 'KukiShinobu',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withConds(underHP: boolean, c6Trigger: boolean): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    KukiShinobu: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (underHP) {
    wrConditionals.KukiShinobu.underHP = 'on'
    pandoConditionals.push({
      sheet: 'KukiShinobu',
      src: '0',
      dst: null,
      name: 'underHP',
      value: 1,
    })
  }
  if (c6Trigger) {
    wrConditionals.KukiShinobu.c6Trigger = 'on'
    pandoConditionals.push({
      sheet: 'KukiShinobu',
      src: '0',
      dst: null,
      name: 'c6Trigger',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('KukiShinobu WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (underHP=%s c6Trigger=%s)', (underHP, c6Trigger) => {
    const fixture = withConds(underHP, c6Trigger)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const wrHeal_ = wr.get(input.total.heal_).value as number
    const pandoHeal_ = pando.compute(own.final.heal_).val as number
    expect(relDiff(wrHeal_, pandoHeal_)).toBeLessThan(1e-4)
    expect(pandoHeal_).toBeCloseTo(underHP ? 0.15 : 0)
  })
})
