/**
 * Citlali WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * WR lookup c6NsConsumed (states `'2'`..`'40'` step 2) → Pando
 * `allNumConditionals` 0–maxStacks. Fixture: WR string key ↔ Pando integer.
 *
 * A1 pyro/hydro RES is enemy preRes. C1 NA/CA/plunge/skill/burst dmgInc is
 * notOwnBuff (WR unequal self; not dest-gated). C2 team EM is notOwnBuff +
 * destIsActive. C6 pyro/hydro_dmg_ is WR teamBuff (solo computeUIData does not
 * apply it). C6 all_dmg_ is ownBuff. C2 self EM is unconditional ownBuff.
 * Skip none of DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- citlali.spec.ts
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
        key: 'Citlali',
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
        location: 'Citlali',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'c4',
  'charged',
  'frostfallStormDmg',
  'iceStormDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'obsidianDmg',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_shield',
  'skill_shieldCryo',
  'skullDmg',
]

type CitlaliConds = {
  a1NsFreezeMelt?: boolean
  c1BladeConsume?: boolean
  c2ShieldEleMas?: boolean
  c6NsConsumed?: number
}

function withConds(conds: CitlaliConds): ParityFixture {
  const wrCitlali: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.a1NsFreezeMelt) {
    wrCitlali.a1NsFreezeMelt = 'on'
    pandoConditionals.push({
      sheet: 'Citlali',
      src: '0',
      dst: null,
      name: 'a1NsFreezeMelt',
      value: 1,
    })
  }
  if (conds.c1BladeConsume) {
    wrCitlali.c1BladeConsume = 'on'
    pandoConditionals.push({
      sheet: 'Citlali',
      src: '0',
      dst: null,
      name: 'c1BladeConsume',
      value: 1,
    })
  }
  if (conds.c2ShieldEleMas) {
    wrCitlali.c2ShieldEleMas = 'on'
    pandoConditionals.push({
      sheet: 'Citlali',
      src: '0',
      dst: null,
      name: 'c2ShieldEleMas',
      value: 1,
    })
  }
  if (conds.c6NsConsumed) {
    wrCitlali.c6NsConsumed = String(conds.c6NsConsumed)
    pandoConditionals.push({
      sheet: 'Citlali',
      src: '0',
      dst: null,
      name: 'c6NsConsumed',
      value: conds.c6NsConsumed,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Citlali: wrCitlali },
    pandoConditionals,
  }
}

describe('Citlali WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a1NsFreezeMelt: true }],
    [{ c1BladeConsume: true }],
    [{ c2ShieldEleMas: true }],
    [{ c6NsConsumed: 40 }],
    [
      {
        a1NsFreezeMelt: true,
        c1BladeConsume: true,
        c2ShieldEleMas: true,
        c6NsConsumed: 40,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of EXPECTED_LISTINGS) {
      expect(names, name).toContain(name)
    }

    if (conds.c6NsConsumed) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.premod.dmg_).val as number).toBeGreaterThan(
        off.compute(own.premod.dmg_).val as number
      )
    }
  })
})
