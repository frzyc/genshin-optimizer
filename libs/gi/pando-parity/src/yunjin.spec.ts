/**
 * YunJin WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Burst cond is WR `skill` (Flying Cloud). TeamBuff NA flat / C2 NA dmg_ / C6
 * atkSPD_ are not dest-gated. Solo computeUIData does not apply WR teamBuff;
 * Pando teamBuff does. Burst on: DEFAULT_FINALS are unchanged (skip none);
 * Pando `formula.base.normal` and `atkSPD_` are probed instead.
 *
 *   nx test gi-pando-parity -- yunjin.spec.ts
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
        key: 'YunJin',
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
        location: 'YunJin',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withConds(skillOn: boolean, c4On: boolean): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    YunJin: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillOn) {
    wrConditionals.YunJin.skill = 'on'
    pandoConditionals.push({
      sheet: 'YunJin',
      src: '0',
      dst: null,
      name: 'skill',
      value: 1,
    })
  }
  if (c4On) {
    wrConditionals.YunJin.c4 = 'on'
    pandoConditionals.push({
      sheet: 'YunJin',
      src: '0',
      dst: null,
      name: 'c4',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('YunJin WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (skill=%s c4=%s)', (skillOn, c4On) => {
    const fixture = withConds(skillOn, c4On)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff (NA flat / C2 / C6) is hidden in solo UIData; those do not
    // move DEFAULT_FINALS. C4 def_ is ownBuff and is compared.
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of [
      'charged',
      'skill',
      'skill_dmg1',
      'skill_dmg2',
      'skill_shield',
      'burst',
      'burst_dmgInc',
    ]) {
      expect(names, name).toContain(name)
    }

    if (skillOn) {
      const off = buildPando(FIXTURE)
      expect(
        pando.compute(own.formula.base.normal).val as number
      ).toBeGreaterThan(off.compute(own.formula.base.normal).val as number)
      expect(pando.compute(own.final.atkSPD_).val as number).toBeCloseTo(
        (off.compute(own.final.atkSPD_).val as number) + 0.12
      )
    }
    if (c4On) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.def_).val as number).toBeCloseTo(
        (off.compute(own.final.def_).val as number) + 0.2
      )
    }
  })
})
