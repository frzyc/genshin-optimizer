/**
 * Durin WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * Hexerei A1 amplify needs hexerei >= 2 (WR tally overlay + extra Pando tally).
 *
 *   nx test gi-pando-parity -- durin.spec.ts
 */
import { hexereiTally, withMember } from '@genshin-optimizer/gi/formula'
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
        key: 'Durin',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusSword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Durin',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

type DurinConds = {
  lockHomework?: boolean
  burstForm?: 'white' | 'dark'
  a1WhiteDendro?: boolean
  a4Stack?: boolean
  c1Stacks?: boolean
  c2AfterBurst?: boolean
  c2Hydro?: boolean
  c6LightBurstHit?: boolean
}

function withConds(conds: DurinConds): ParityFixture {
  const wrDurin: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.lockHomework) {
    wrDurin.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Durin',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (conds.burstForm) {
    wrDurin.burstForm = conds.burstForm
    pandoConditionals.push({
      sheet: 'Durin',
      src: '0',
      dst: null,
      name: 'burstForm',
      value: conds.burstForm === 'white' ? 1 : 2,
    })
  }
  if (conds.a1WhiteDendro) {
    wrDurin.a1WhiteDendro = 'dendro'
    pandoConditionals.push({
      sheet: 'Durin',
      src: '0',
      dst: null,
      name: 'a1WhiteDendro',
      value: 1,
    })
  }
  for (const name of [
    'a4Stack',
    'c1Stacks',
    'c2AfterBurst',
    'c6LightBurstHit',
  ] as const) {
    if (!conds[name]) continue
    wrDurin[name] = 'on'
    pandoConditionals.push({
      sheet: 'Durin',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  if (conds.c2Hydro) {
    wrDurin.c2Hydro = 'hydro'
    pandoConditionals.push({
      sheet: 'Durin',
      src: '0',
      dst: null,
      name: 'c2Hydro',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    ...(conds.lockHomework
      ? {
          wrTally: { hexerei: 2 },
          extraPando: withMember('0', hexereiTally(1)),
        }
      : {}),
    wrConditionals: { Durin: wrDurin },
    pandoConditionals,
  }
}

describe('Durin WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ lockHomework: true }],
    [
      {
        lockHomework: true,
        burstForm: 'white' as const,
        a1WhiteDendro: true,
        c1Stacks: true,
        c2AfterBurst: true,
        c2Hydro: true,
        c6LightBurstHit: true,
      },
    ],
    [
      {
        lockHomework: true,
        burstForm: 'dark' as const,
        a4Stack: true,
        c1Stacks: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })
})
