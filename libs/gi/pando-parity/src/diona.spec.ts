/**
 * Diona WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * C6 hp_ is ownBuff via lockRevelation (hexerei). Constellation6 list is
 * teamBuff eleMas/incHeal_ (solo computeUIData does not apply teamBuff).
 *
 *   nx test gi-pando-parity -- diona.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Diona',
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
        location: 'Diona',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_staminaDec_',
  'burst',
  'burst_field',
  'burst_heal',
  'c2_holdCryoShield',
  'c2_holdShield',
  'c2_pressCryoShield',
  'c2_pressShield',
  'charged_aimed',
  'charged_aimedCharged',
  'holdCryoShield',
  'holdShield',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'pressCryoShield',
  'pressShield',
  'skill',
]

function withConds(
  lockRevelation: boolean,
  c6?: 'lower' | 'higher'
): ParityFixture {
  const wrDiona: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockRevelation) {
    wrDiona.lockRevelation = 'on'
    pandoConditionals.push({
      sheet: 'Diona',
      src: '0',
      dst: null,
      name: 'lockRevelation',
      value: 1,
    })
  }
  if (c6) {
    wrDiona.Constellation6 = c6
    pandoConditionals.push({
      sheet: 'Diona',
      src: '0',
      dst: null,
      name: 'Constellation6',
      value: c6 === 'lower' ? 1 : 2,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Diona: wrDiona },
    pandoConditionals,
  }
}

describe('Diona WR ↔ Pando finals', () => {
  test.each([
    [false, undefined],
    [true, undefined],
    [true, 'lower'],
  ] as const)('aligned finals (lockRevelation=%s Constellation6=%s)', (lockRevelation, c6) => {
    const fixture = withConds(lockRevelation, c6)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const hpOff = buildPando(withConds(false)).compute(own.final.hp)
      .val as number
    const hpOn = pando.compute(own.final.hp).val as number
    if (lockRevelation) expect(hpOn).toBeGreaterThan(hpOff)
    else expect(hpOn).toBeCloseTo(hpOff)
  })
})
