/**
 * Qiqi WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 *   nx test gi-pando-parity -- qiqi.spec.ts
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
        key: 'Qiqi',
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
        location: 'Qiqi',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

type QiqiConds = {
  lockRevelation?: boolean
  lockStellarRadianceSc?: 'on' | 'ss'
  QiqiLk?: boolean
  QiqiA1?: boolean
  QiqiC2?: boolean
  QiqiC6?: boolean
}

function withConds(conds: QiqiConds): ParityFixture {
  const wrQiqi: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.lockRevelation) {
    wrQiqi.lockRevelation = 'on'
    pandoConditionals.push({
      sheet: 'Qiqi',
      src: '0',
      dst: null,
      name: 'lockRevelation',
      value: 1,
    })
  }
  if (conds.lockStellarRadianceSc) {
    wrQiqi.lockStellarRadianceSc = conds.lockStellarRadianceSc
    pandoConditionals.push({
      sheet: 'Qiqi',
      src: '0',
      dst: null,
      name: 'lockStellarRadianceSc',
      value: conds.lockStellarRadianceSc === 'on' ? 1 : 2,
    })
  }
  for (const name of ['QiqiLk', 'QiqiA1', 'QiqiC2', 'QiqiC6'] as const) {
    if (!conds[name]) continue
    wrQiqi[name] = 'on'
    pandoConditionals.push({
      sheet: 'Qiqi',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Qiqi: wrQiqi },
    pandoConditionals,
  }
}

describe('Qiqi WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ QiqiC2: true }],
    [{ lockRevelation: true, lockStellarRadianceSc: 'on' as const }],
    [
      {
        lockRevelation: true,
        lockStellarRadianceSc: 'on' as const,
        QiqiLk: true,
        QiqiA1: true,
        QiqiC2: true,
        QiqiC6: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })

  test('QiqiC2 does not change atk_; hexerei C2 atk_ does', () => {
    const base = buildPando(FIXTURE)
    const c2 = buildPando(withConds({ QiqiC2: true }))
    const hex = buildPando(
      withConds({ lockRevelation: true, lockStellarRadianceSc: 'on' })
    )
    const baseAtk = base.compute(own.final.atk).val as number
    expect(c2.compute(own.final.atk).val).toBeCloseTo(baseAtk)
    expect(hex.compute(own.final.atk).val).toBeGreaterThan(baseAtk)
    assertFinals(buildWrSolo(withConds({ QiqiC2: true })), c2)
    assertFinals(
      buildWrSolo(
        withConds({ lockRevelation: true, lockStellarRadianceSc: 'on' })
      ),
      hex
    )
  })
})
