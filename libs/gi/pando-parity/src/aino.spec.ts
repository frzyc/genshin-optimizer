/**
 * Aino WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * C1 c1AfterSkillOrBurst: ownBuff eleMas (solo UIData applies it). Teammate EM is
 * notOwnBuff + destIsActive (WR unequal(active, self)) — not on Aino herself.
 * C6 c6AfterBurst is WR teamBuff reaction dmg_ dest-gated via destIsActive.
 * Solo computeUIData does not apply WR teamBuff; Pando teamBuff does apply.
 * C6 stats are not in DEFAULT_FINALS; assertFinals is unchanged. Pando
 * electrocharged_dmg_ is probed instead (solo moonsign=1, no gleam extra).
 *
 *   nx test gi-pando-parity -- aino.spec.ts
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
        key: 'Aino',
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
        location: 'Aino',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c2',
  'charged_cyclic',
  'charged_final',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_dmg1',
  'skill_dmg2',
]

function withConds(
  c1AfterSkillOrBurst: boolean,
  c6AfterBurst: boolean
): ParityFixture {
  const wrAino: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (c1AfterSkillOrBurst) {
    wrAino.c1AfterSkillOrBurst = 'on'
    pandoConditionals.push({
      sheet: 'Aino',
      src: '0',
      dst: null,
      name: 'c1AfterSkillOrBurst',
      value: 1,
    })
  }
  if (c6AfterBurst) {
    wrAino.c6AfterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Aino',
      src: '0',
      dst: null,
      name: 'c6AfterBurst',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Aino: wrAino },
    pandoConditionals,
  }
}

describe('Aino WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (c1AfterSkillOrBurst=%s c6AfterBurst=%s)', (c1AfterSkillOrBurst, c6AfterBurst) => {
    const fixture =
      c1AfterSkillOrBurst || c6AfterBurst
        ? withConds(c1AfterSkillOrBurst, c6AfterBurst)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // C1 ownBuff eleMas is in DEFAULT_FINALS; C6 teamBuff reaction dmg_ is not.
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of EXPECTED_LISTINGS) {
      expect(names, name).toContain(name)
    }

    if (c1AfterSkillOrBurst) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeCloseTo(
        (off.compute(own.final.eleMas).val as number) + 80
      )
    }

    const pandoEc = pando.compute(own.premod.dmg_.electrocharged).val as number
    expect(pandoEc).toBeCloseTo(c6AfterBurst ? 0.15 : 0)
  })
})
