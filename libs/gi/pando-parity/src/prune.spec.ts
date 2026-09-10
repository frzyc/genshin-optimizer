/**
 * Prune WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockHomework` / `a4Rally` / `c6RallyReaction` `'on'`. Num `c2Stack`
 * 0–6. List `lockRallyReaction` `'swirl'` (Pando `value: 1`). lockHomework is
 * hexerei tally. a4Rally is notOwnBuff move dmg_. C2 always +10% ATK at C2+.
 * lockRallyReaction self atk_ is own; team atk_ is notOwnBuff anemo+hexerei.
 * c6RallyReaction flat ATK is own + destIsActive notOwnBuff. C3 burst / C5 skill.
 *
 *   nx test gi-pando-parity -- prune.spec.ts
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
        key: 'Prune',
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
        location: 'Prune',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_cryo',
  'a1_electro',
  'a1_hydro',
  'a1_pyro',
  'burst',
  'burst_bell',
  'c4_cryo',
  'c4_electro',
  'c4_hydro',
  'c4_pyro',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_clang_cryo',
  'skill_clang_electro',
  'skill_clang_hydro',
  'skill_clang_pyro',
  'skill_ring',
]

function withConds(
  lockHomework: boolean,
  a4Rally: boolean,
  c2Stack: number
): ParityFixture {
  const wrPrune: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockHomework) {
    wrPrune.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Prune',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (a4Rally) {
    wrPrune.a4Rally = 'on'
    pandoConditionals.push({
      sheet: 'Prune',
      src: '0',
      dst: null,
      name: 'a4Rally',
      value: 1,
    })
  }
  if (c2Stack) {
    wrPrune.c2Stack = String(c2Stack)
    pandoConditionals.push({
      sheet: 'Prune',
      src: '0',
      dst: null,
      name: 'c2Stack',
      value: c2Stack,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Prune: wrPrune },
    pandoConditionals,
  }
}

describe('Prune WR ↔ Pando finals', () => {
  test.each([
    [false, false, 0],
    [true, false, 0],
    [false, true, 0],
    [false, false, 6],
    [true, true, 6],
  ] as const)('aligned finals (lockHomework=%s a4Rally=%s c2Stack=%s)', (lockHomework, a4Rally, c2Stack) => {
    const fixture =
      lockHomework || a4Rally || c2Stack
        ? withConds(lockHomework, a4Rally, c2Stack)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c2Stack) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
