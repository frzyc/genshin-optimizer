/**
 * Mona WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockHomework` / `Omen` / `ProphecyOfSubmersion` / `lockC2Charged`.
 * Num `RhetoricsOfCalamitas` 0–3 and `lockStacks` 0–max ↔ WR `'1'`…`'N'`.
 * C3 burst / C5 skill. Omen C4 critRate_ is teamBuff — skip `critRate_` when on.
 * lockC2 eleMas and lockC4 hex critDMG_ are teamBuff — skip those finals when on.
 *
 *   nx test gi-pando-parity -- mona.spec.ts
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
        key: 'Mona',
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
        location: 'Mona',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1',
  'burst',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_dmg',
  'skill_dot',
]

function withConds(
  lockHomework: boolean,
  Omen: boolean,
  ProphecyOfSubmersion: boolean,
  lockC2Charged: boolean,
  RhetoricsOfCalamitas: number
): ParityFixture {
  const wrMona: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockHomework) {
    wrMona.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Mona',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (Omen) {
    wrMona.Omen = 'on'
    pandoConditionals.push({
      sheet: 'Mona',
      src: '0',
      dst: null,
      name: 'Omen',
      value: 1,
    })
  }
  if (ProphecyOfSubmersion) {
    wrMona.ProphecyOfSubmersion = 'on'
    pandoConditionals.push({
      sheet: 'Mona',
      src: '0',
      dst: null,
      name: 'ProphecyOfSubmersion',
      value: 1,
    })
  }
  if (lockC2Charged) {
    wrMona.lockC2Charged = 'on'
    pandoConditionals.push({
      sheet: 'Mona',
      src: '0',
      dst: null,
      name: 'lockC2Charged',
      value: 1,
    })
  }
  if (RhetoricsOfCalamitas > 0) {
    wrMona.RhetoricsOfCalamitas = String(RhetoricsOfCalamitas)
    pandoConditionals.push({
      sheet: 'Mona',
      src: '0',
      dst: null,
      name: 'RhetoricsOfCalamitas',
      value: RhetoricsOfCalamitas,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Mona: wrMona },
    pandoConditionals,
  }
}

describe('Mona WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false, 0],
    [true, false, false, false, 0],
    [false, true, false, false, 0],
    [false, false, true, false, 0],
    [true, true, true, true, 3],
  ] as const)('aligned finals (homework=%s Omen=%s C1=%s lockC2=%s C6=%s)', (lockHomework, Omen, ProphecyOfSubmersion, lockC2Charged, RhetoricsOfCalamitas) => {
    const fixture =
      lockHomework ||
      Omen ||
      ProphecyOfSubmersion ||
      lockC2Charged ||
      RhetoricsOfCalamitas
        ? withConds(
            lockHomework,
            Omen,
            ProphecyOfSubmersion,
            lockC2Charged,
            RhetoricsOfCalamitas
          )
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    const skip = new Set<string>()
    if (Omen) skip.add('critRate_')
    if (lockHomework && Omen) skip.add('critDMG_')
    if (lockHomework && lockC2Charged) skip.add('eleMas')
    assertFinals(
      wr,
      pando,
      DEFAULT_FINALS.filter((s) => !skip.has(s))
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (Omen) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critRate_).val as number).toBeGreaterThan(
        off.compute(own.final.critRate_).val as number
      )
    }
  })
})
