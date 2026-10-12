/**
 * Lauma WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `skillVerdantDew` 1–3 (WR lookup). Bools `skillAfterHit` / `burstPaleHymn`
 * / `a1AfterSkill` `'on'`. C3 burst / C5 skill (matches WR; atypical).
 * skillAfterHit is WR teamBuff dendro/hydro_enemyRes_ → enemy preRes (sign kept).
 * Pale Hymn / C2 bloom dmgInc are customParam (no *_dmgInc tag); lunarbloom
 * flat is also formula.base on lunar listings. A0 / C2 lunarbloom_dmg_ are
 * teamBuff (hidden in solo UIData). C6 specialMult_ is ownBuff dmg_.lunarbloom
 * (needs gleam; solo moonsign is 1). A4 skill_dmg_ is ownBuff (not DEFAULT_FINALS).
 * Lunar hits are WR lunarDmgNode → Pando customDmg (no lunar transDef).
 *
 *   nx test gi-pando-parity -- lauma.spec.ts
 */
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
        key: 'Lauma',
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
        location: 'Lauma',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_lunarbloom_baseDmg_',
  'a4_charged_cdRed_',
  'a4_skill_dmg_',
  'burstPaleHymn_bloom_dmgInc',
  'burstPaleHymn_burgeon_dmgInc',
  'burstPaleHymn_hyperbloom_dmgInc',
  'burstPaleHymn_lunarbloom_dmgInc',
  'c1_heal',
  'c2PaleHymn_bloom_dmgInc',
  'c2PaleHymn_burgeon_dmgInc',
  'c2PaleHymn_hyperbloom_dmgInc',
  'c2PaleHymn_lunarbloom_dmgInc',
  'c6_dmg1',
  'c6_dmg2',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_frostgroveDmg',
  'skill_hold1Dmg',
  'skill_hold2Dmg',
  'skill_pressDmg',
]

function withConds(
  skillVerdantDew: number,
  skillAfterHit: boolean,
  burstPaleHymn: boolean,
  a1AfterSkill: boolean
): ParityFixture {
  const wrLauma: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillVerdantDew) {
    wrLauma.skillVerdantDew = String(skillVerdantDew)
    pandoConditionals.push({
      sheet: 'Lauma',
      src: '0',
      dst: null,
      name: 'skillVerdantDew',
      value: skillVerdantDew,
    })
  }
  if (skillAfterHit) {
    wrLauma.skillAfterHit = 'on'
    pandoConditionals.push({
      sheet: 'Lauma',
      src: '0',
      dst: null,
      name: 'skillAfterHit',
      value: 1,
    })
  }
  if (burstPaleHymn) {
    wrLauma.burstPaleHymn = 'on'
    pandoConditionals.push({
      sheet: 'Lauma',
      src: '0',
      dst: null,
      name: 'burstPaleHymn',
      value: 1,
    })
  }
  if (a1AfterSkill) {
    wrLauma.a1AfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Lauma',
      src: '0',
      dst: null,
      name: 'a1AfterSkill',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Lauma: wrLauma },
    pandoConditionals,
  }
}

describe('Lauma WR ↔ Pando finals', () => {
  test.each([
    [0, false, false, false],
    [3, false, false, false],
    [0, true, false, false],
    [0, false, true, false],
    [0, false, false, true],
    [3, true, true, true],
  ] as const)('aligned finals (skillVerdantDew=%s skillAfterHit=%s burstPaleHymn=%s a1AfterSkill=%s)', (skillVerdantDew, skillAfterHit, burstPaleHymn, a1AfterSkill) => {
    const fixture =
      skillVerdantDew || skillAfterHit || burstPaleHymn || a1AfterSkill
        ? withConds(skillVerdantDew, skillAfterHit, burstPaleHymn, a1AfterSkill)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
