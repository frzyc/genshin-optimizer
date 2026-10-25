/**
 * Faruzan WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * TeamBuff conds (burstBenefit / burstHit / a4Active / c6Crit): solo computeUIData
 * does not apply WR teamBuff; skip those hidden stats in WR finals. Pando teamBuff
 * does apply on self.
 *
 * burstHit: WR `teamBuff.premod.anemo_enemyRes_` is attacker-tagged; Pando writes
 * `enemyDebuff.common.preRes.anemo` (enemy). Keep WR sign (already negative in dm).
 *
 * C3 is skill +3, C5 is burst +3 (inverted). burstBenefit anemo_dmg_ uses burst talent.
 *
 *   nx test gi-pando-parity -- faruzan.spec.ts
 */
import { enemy, own } from '@genshin-optimizer/gi/formula'
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
        key: 'Faruzan',
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
        location: 'Faruzan',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'charged_aimed',
  'charged_aimedCharged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'vortexDmg',
]

function withConds(
  burstBenefit: boolean,
  burstHit: boolean,
  a4Active: boolean,
  c6Crit: boolean
): ParityFixture {
  const wrFaruzan: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (burstBenefit) {
    wrFaruzan.burstBenefit = 'on'
    pandoConditionals.push({
      sheet: 'Faruzan',
      src: '0',
      dst: null,
      name: 'burstBenefit',
      value: 1,
    })
  }
  if (burstHit) {
    wrFaruzan.burstHit = 'on'
    pandoConditionals.push({
      sheet: 'Faruzan',
      src: '0',
      dst: null,
      name: 'burstHit',
      value: 1,
    })
  }
  if (a4Active) {
    wrFaruzan.a4Active = 'on'
    pandoConditionals.push({
      sheet: 'Faruzan',
      src: '0',
      dst: null,
      name: 'a4Active',
      value: 1,
    })
  }
  if (c6Crit) {
    wrFaruzan.c6Crit = 'on'
    pandoConditionals.push({
      sheet: 'Faruzan',
      src: '0',
      dst: null,
      name: 'c6Crit',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Faruzan: wrFaruzan },
    pandoConditionals,
  }
}

describe('Faruzan WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false],
    [true, true, true, true],
  ] as const)('aligned finals (burstBenefit=%s burstHit=%s a4Active=%s c6Crit=%s)', (burstBenefit, burstHit, a4Active, c6Crit) => {
    const fixture = withConds(burstBenefit, burstHit, a4Active, c6Crit)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // TeamBuff anemo_dmg_ / enemy RES / A4 base / C6 critDMG_ are hidden in solo WR.
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const pandoAnemoDmg_ = pando.compute(own.final.dmg_.anemo).val as number
    // C5 burst +3 on talent 8 → burst lvl 11 → dm.burst.anemo_dmg_[10] = 0.342
    expect(pandoAnemoDmg_).toBeCloseTo(burstBenefit ? 0.342 : 0)

    const pandoAnemoRes = pando.compute(enemy.common.preRes.anemo).val as number
    expect(pandoAnemoRes).toBeCloseTo(burstHit ? 0.1 - 0.3 : 0.1)

    const pandoAnemoCritDmg = pando.compute(own.final.critDMG_.anemo)
      .val as number
    const offAnemoCritDmg = buildPando(
      withConds(false, false, false, false)
    ).compute(own.final.critDMG_.anemo).val as number
    expect(pandoAnemoCritDmg).toBeCloseTo(
      offAnemoCritDmg + (burstBenefit && c6Crit ? 0.4 : 0)
    )
  })
})
