/**
 * Jahoda WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * a4Heal is WR teamBuff eleMas dest-gated via destIsActive. Solo computeUIData
 * does not apply WR teamBuff; Pando teamBuff does. a4Heal on: assertFinals
 * skips `eleMas`; Pando eleMas delta is checked instead.
 *
 * c6FlaskFull is WR teamBuff critRate_/critDMG_ dest-gated to moonsign chars
 * and tally.moonsign >= 2 (Ascendant Gleam). Solo Jahoda moonsign=1, so C6
 * does not apply; crit stats stay in DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- jahoda.spec.ts
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
        key: 'Jahoda',
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
        location: 'Jahoda',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_lowestHeal',
  'burst_robotDmgCryo',
  'burst_robotDmgElectro',
  'burst_robotDmgHydro',
  'burst_robotDmgPyro',
  'burst_robotHeal',
  'charged_aimed',
  'charged_aimedCharged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_bombDmg',
  'skill_filledDmg',
  'skill_meowDmgCryo',
  'skill_meowDmgElectro',
  'skill_meowDmgHydro',
  'skill_meowDmgPyro',
  'skill_unfilledDmg',
]

function withConds(a4Heal: boolean, c6FlaskFull: boolean): ParityFixture {
  const wrJahoda: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4Heal) {
    wrJahoda.a4Heal = 'on'
    pandoConditionals.push({
      sheet: 'Jahoda',
      src: '0',
      dst: null,
      name: 'a4Heal',
      value: 1,
    })
  }
  if (c6FlaskFull) {
    wrJahoda.c6FlaskFull = 'on'
    pandoConditionals.push({
      sheet: 'Jahoda',
      src: '0',
      dst: null,
      name: 'c6FlaskFull',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Jahoda: wrJahoda },
    pandoConditionals,
  }
}

describe('Jahoda WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (a4Heal=%s c6FlaskFull=%s)', (a4Heal, c6FlaskFull) => {
    const fixture =
      a4Heal || c6FlaskFull ? withConds(a4Heal, c6FlaskFull) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.eleMas is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      a4Heal ? DEFAULT_FINALS.filter((s) => s !== 'eleMas') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of EXPECTED_LISTINGS) {
      expect(names, name).toContain(name)
    }

    if (a4Heal) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeCloseTo(
        (off.compute(own.final.eleMas).val as number) + 100
      )
    }
  })
})
