/**
 * Yaoyao WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * adeptalLegacy is ownBuff (dendro RES / moveSPD).
 * c1Explode is WR teamBuff dendro_dmg_ (active only); solo computeUIData does
 * not apply it. Pando still gets destIsActive dendro_dmg_ in this solo fixture.
 * c4AfterSkillBurst is ownBuff eleMas (in assertFinals).
 *
 *   nx test gi-pando-parity -- yaoyao.spec.ts
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
        key: 'Yaoyao',
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
        location: 'Yaoyao',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withConds(
  adeptalLegacy: boolean,
  c1Explode: boolean,
  c4AfterSkillBurst: boolean
): ParityFixture {
  const wrYaoyao: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (adeptalLegacy) {
    wrYaoyao.adeptalLegacy = 'on'
    pandoConditionals.push({
      sheet: 'Yaoyao',
      src: '0',
      dst: null,
      name: 'adeptalLegacy',
      value: 1,
    })
  }
  if (c1Explode) {
    wrYaoyao.c1Explode = 'on'
    pandoConditionals.push({
      sheet: 'Yaoyao',
      src: '0',
      dst: null,
      name: 'c1Explode',
      value: 1,
    })
  }
  if (c4AfterSkillBurst) {
    wrYaoyao.c4AfterSkillBurst = 'on'
    pandoConditionals.push({
      sheet: 'Yaoyao',
      src: '0',
      dst: null,
      name: 'c4AfterSkillBurst',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Yaoyao: wrYaoyao },
    pandoConditionals,
  }
}

describe('Yaoyao WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (adeptalLegacy=%s c1Explode=%s c4AfterSkillBurst=%s)', (adeptalLegacy, c1Explode, c4AfterSkillBurst) => {
    const fixture =
      adeptalLegacy || c1Explode || c4AfterSkillBurst
        ? withConds(adeptalLegacy, c1Explode, c4AfterSkillBurst)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const pandoDendroDmg_ = pando.compute(own.premod.dmg_.dendro).val as number
    expect(pandoDendroDmg_).toBeCloseTo(c1Explode ? 0.15 : 0)
  })
})
