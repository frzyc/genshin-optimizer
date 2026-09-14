/**
 * Beidou WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * Burst C6 RES / eleMas are WR teamBuff; solo computeUIData does not apply them.
 * burst dmgRed_ has no Pando tag (customParam only).
 * A4 atkSPD_ / dmg_ are not in DEFAULT_FINALS; still assertFinals and probe.
 *
 *   nx test gi-pando-parity -- beidou.spec.ts
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
        key: 'Beidou',
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
        location: 'Beidou',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withConds(burstOn: boolean, a4: boolean): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Beidou: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (burstOn) {
    wrConditionals.Beidou.burst = 'on'
    pandoConditionals.push({
      sheet: 'Beidou',
      src: '0',
      dst: null,
      name: 'burst',
      value: 1,
    })
  }
  if (a4) {
    wrConditionals.Beidou.Ascension4 = 'on'
    pandoConditionals.push({
      sheet: 'Beidou',
      src: '0',
      dst: null,
      name: 'Ascension4',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Beidou WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (burst=%s Ascension4=%s)', (burstOn, a4) => {
    const fixture = withConds(burstOn, a4)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const wrAtkSpd = wr.get(input.total.atkSPD_).value as number
    const pandoAtkSpd = pando.compute(own.final.atkSPD_).val as number
    expect(relDiff(wrAtkSpd, pandoAtkSpd)).toBeLessThan(1e-4)
    expect(pandoAtkSpd).toBeCloseTo(a4 ? 0.15 : 0)

    const wrNormalDmg = wr.get(input.total.normal_dmg_).value as number
    const pandoNormalDmg = pando.compute(own.final.dmg_.normal).val as number
    expect(relDiff(wrNormalDmg, pandoNormalDmg)).toBeLessThan(1e-4)
    expect(pandoNormalDmg).toBeCloseTo(a4 ? 0.15 : 0)

    const wrChargedDmg = wr.get(input.total.charged_dmg_).value as number
    const pandoChargedDmg = pando.compute(own.final.dmg_.charged).val as number
    expect(relDiff(wrChargedDmg, pandoChargedDmg)).toBeLessThan(1e-4)
    expect(pandoChargedDmg).toBeCloseTo(a4 ? 0.15 : 0)
  })
})
