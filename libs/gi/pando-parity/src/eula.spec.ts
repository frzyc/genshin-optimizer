/**
 * Eula WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `Grimheart` `'stack1'|'stack2'`. Bools `grimheartConsumed` /
 * `LightfallSwordC4` / `TidalIllusion`. Num `LightfallSword` 0–30.
 * C3 burst / C5 skill. Grimheart def_ is ownBuff — skip `def` when on.
 *
 *   nx test gi-pando-parity -- eula.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  DEFAULT_FINALS,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Eula',
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
        location: 'Eula',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_shattered',
  'burst',
  'burst_lightfall',
  'charged_final',
  'charged_spin',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_hold',
  'skill_icewhirl',
  'skill_press',
]

function withConds(
  grimheart: 0 | 1 | 2,
  grimheartConsumed: boolean,
  lightfall: number,
  c4: boolean,
  tidal: boolean
): ParityFixture {
  const wrEula: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (grimheart) {
    wrEula.Grimheart = grimheart === 1 ? 'stack1' : 'stack2'
    pandoConditionals.push({
      sheet: 'Eula',
      src: '0',
      dst: null,
      name: 'Grimheart',
      value: grimheart,
    })
  }
  if (grimheartConsumed) {
    wrEula.grimheartConsumed = 'on'
    pandoConditionals.push({
      sheet: 'Eula',
      src: '0',
      dst: null,
      name: 'grimheartConsumed',
      value: 1,
    })
  }
  if (lightfall > 0) {
    wrEula.LightfallSword = String(lightfall)
    pandoConditionals.push({
      sheet: 'Eula',
      src: '0',
      dst: null,
      name: 'LightfallSword',
      value: lightfall,
    })
  }
  if (c4) {
    wrEula.LightfallSwordC4 = 'on'
    pandoConditionals.push({
      sheet: 'Eula',
      src: '0',
      dst: null,
      name: 'LightfallSwordC4',
      value: 1,
    })
  }
  if (tidal) {
    wrEula.TidalIllusion = 'on'
    pandoConditionals.push({
      sheet: 'Eula',
      src: '0',
      dst: null,
      name: 'TidalIllusion',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Eula: wrEula },
    pandoConditionals,
  }
}

describe('Eula WR ↔ Pando finals', () => {
  test.each([
    [0, false, 0, false, false],
    [2, false, 0, false, false],
    [0, true, 0, false, false],
    [0, false, 30, true, true],
    [2, true, 30, true, true],
  ] as const)('aligned finals (grim=%s consumed=%s sword=%s c4=%s tidal=%s)', (grimheart, grimheartConsumed, lightfall, c4, tidal) => {
    const fixture =
      grimheart || grimheartConsumed || lightfall || c4 || tidal
        ? withConds(grimheart, grimheartConsumed, lightfall, c4, tidal)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      grimheart ? DEFAULT_FINALS.filter((s) => s !== 'def') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (grimheart) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.def).val as number).toBeGreaterThan(
        off.compute(own.final.def).val as number
      )
    }
  })
})
