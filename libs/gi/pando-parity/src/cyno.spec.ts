/**
 * Cyno WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockRevelation` / `lockStellarRadianceSc` / `afterBurst` /
 * `a1Judication` / `c1Together`. Num `c2NormHitStacks` / `c2TeamHit`.
 * C3 burst / C5 skill. afterBurst eleMas is ownBuff. C1 eleMas is dest-gated
 * teamBuff — skip `eleMas` when that cond is on.
 *
 *   nx test gi-pando-parity -- cyno.spec.ts
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
        key: 'Cyno',
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
        location: 'Cyno',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_bolt',
  'burst_charged',
  'burst_normal_0',
  'burst_normal_1',
  'burst_normal_2',
  'burst_normal_3',
  'burst_normal_4',
  'burst_plunging_dmg',
  'burst_plunging_high',
  'burst_plunging_low',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_rite',
]

function withConds(
  afterBurst: boolean,
  a1Judication: boolean,
  c1Together: boolean,
  c2NormHitStacks: number,
  lockRevelation = false
): ParityFixture {
  const wrCyno: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (afterBurst) {
    wrCyno.afterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Cyno',
      src: '0',
      dst: null,
      name: 'afterBurst',
      value: 1,
    })
  }
  if (a1Judication) {
    wrCyno.a1Judication = 'on'
    pandoConditionals.push({
      sheet: 'Cyno',
      src: '0',
      dst: null,
      name: 'a1Judication',
      value: 1,
    })
  }
  if (c1Together) {
    wrCyno.c1Together = 'on'
    wrCyno.lockRevelation = 'on'
    wrCyno.lockStellarRadianceSc = 'on'
    pandoConditionals.push(
      {
        sheet: 'Cyno',
        src: '0',
        dst: null,
        name: 'c1Together',
        value: 1,
      },
      {
        sheet: 'Cyno',
        src: '0',
        dst: null,
        name: 'lockRevelation',
        value: 1,
      },
      {
        sheet: 'Cyno',
        src: '0',
        dst: null,
        name: 'lockStellarRadianceSc',
        value: 1,
      }
    )
  } else if (lockRevelation) {
    wrCyno.lockRevelation = 'on'
    pandoConditionals.push({
      sheet: 'Cyno',
      src: '0',
      dst: null,
      name: 'lockRevelation',
      value: 1,
    })
  }
  if (c2NormHitStacks > 0) {
    wrCyno.c2NormHitStacks = String(c2NormHitStacks)
    pandoConditionals.push({
      sheet: 'Cyno',
      src: '0',
      dst: null,
      name: 'c2NormHitStacks',
      value: c2NormHitStacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Cyno: wrCyno },
    pandoConditionals,
  }
}

describe('Cyno WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, 0, false],
    [true, false, false, 0, false],
    [false, true, false, 0, false],
    [false, false, true, 0, false],
    [true, true, false, 4, true],
  ] as const)('aligned finals (burst=%s a1=%s c1=%s c2=%s hex=%s)', (afterBurst, a1Judication, c1Together, c2NormHitStacks, lockRevelation) => {
    const fixture =
      afterBurst ||
      a1Judication ||
      c1Together ||
      c2NormHitStacks ||
      lockRevelation
        ? withConds(
            afterBurst,
            a1Judication,
            c1Together,
            c2NormHitStacks,
            lockRevelation
          )
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      c1Together ? DEFAULT_FINALS.filter((s) => s !== 'eleMas') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (afterBurst && !c1Together) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
    }
  })
})
