/**
 * ShikanoinHeizou WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `declensionStacks` 0–4 ↔ WR `'1'`…`'4'`. Bools `skillHit` / `takeField`.
 * C3 skill / C5 burst. A4 eleMas is notOwnBuff (WR unequal self). C1 atkSPD_
 * is ownBuff. staminaSprintDec_ is customParam only.
 *
 *   nx test gi-pando-parity -- shikanoinheizou.spec.ts
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
        key: 'ShikanoinHeizou',
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
        location: 'ShikanoinHeizou',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_iris_cryo',
  'burst_iris_electro',
  'burst_iris_hydro',
  'burst_iris_pyro',
  'burst_slugger',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'normal_6',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

function withConds(
  declensionStacks: number,
  skillHit: boolean,
  takeField: boolean
): ParityFixture {
  const wrHeizou: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (declensionStacks > 0) {
    wrHeizou.declensionStacks = String(declensionStacks)
    pandoConditionals.push({
      sheet: 'ShikanoinHeizou',
      src: '0',
      dst: null,
      name: 'declensionStacks',
      value: declensionStacks,
    })
  }
  if (skillHit) {
    wrHeizou.skillHit = 'on'
    pandoConditionals.push({
      sheet: 'ShikanoinHeizou',
      src: '0',
      dst: null,
      name: 'skillHit',
      value: 1,
    })
  }
  if (takeField) {
    wrHeizou.takeField = 'on'
    pandoConditionals.push({
      sheet: 'ShikanoinHeizou',
      src: '0',
      dst: null,
      name: 'takeField',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { ShikanoinHeizou: wrHeizou },
    pandoConditionals,
  }
}

describe('ShikanoinHeizou WR ↔ Pando finals', () => {
  test.each([
    [0, false, false],
    [4, false, false],
    [0, true, false],
    [0, false, true],
    [4, true, true],
  ] as const)('aligned finals (stacks=%s skillHit=%s takeField=%s)', (declensionStacks, skillHit, takeField) => {
    const fixture =
      declensionStacks || skillHit || takeField
        ? withConds(declensionStacks, skillHit, takeField)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (takeField) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atkSPD_).val as number).toBeGreaterThan(
        off.compute(own.final.atkSPD_).val as number
      )
    }
  })
})
