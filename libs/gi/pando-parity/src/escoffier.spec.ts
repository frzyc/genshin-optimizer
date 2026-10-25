/**
 * Escoffier WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * A4 hydro/cryo RES is enemy preRes (not DEFAULT_FINALS). C1 cryo_critDMG_ is
 * teamBuff but needs hydro+cryo count == 4, so solo does not apply. C2
 * cryo_dmgInc is notOwnBuff (dest ≠ source). Skip none of DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- escoffier.spec.ts
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
        key: 'Escoffier',
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
        location: 'Escoffier',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

function withConds(
  a4SkillBurstHit: boolean,
  c1AfterSkillBurst: boolean,
  c2Stacks: boolean
): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Escoffier: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4SkillBurstHit) {
    wrConditionals.Escoffier.a4SkillBurstHit = 'on'
    pandoConditionals.push({
      sheet: 'Escoffier',
      src: '0',
      dst: null,
      name: 'a4SkillBurstHit',
      value: 1,
    })
  }
  if (c1AfterSkillBurst) {
    wrConditionals.Escoffier.c1AfterSkillBurst = 'on'
    pandoConditionals.push({
      sheet: 'Escoffier',
      src: '0',
      dst: null,
      name: 'c1AfterSkillBurst',
      value: 1,
    })
  }
  if (c2Stacks) {
    wrConditionals.Escoffier.c2Stacks = 'on'
    pandoConditionals.push({
      sheet: 'Escoffier',
      src: '0',
      dst: null,
      name: 'c2Stacks',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Escoffier WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (a4SkillBurstHit=%s c1AfterSkillBurst=%s c2Stacks=%s)', (a4SkillBurstHit, c1AfterSkillBurst, c2Stacks) => {
    const fixture = withConds(a4SkillBurstHit, c1AfterSkillBurst, c2Stacks)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR-hidden teamBuff stats do not move DEFAULT_FINALS in solo (see header).
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of [
      'charged',
      'skill',
      'parfaitDmg',
      'bladeDmg',
      'burst',
      'burst_heal',
      'a1_heal',
      'c6',
      'c2Stacks_cryo_dmgInc',
    ]) {
      expect(names, name).toContain(name)
    }
  })
})
