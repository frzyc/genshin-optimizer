/**
 * Artifact batch `selfA` WR ↔ Pando number-check.
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import {
  artSetPieces,
  assertFinals,
  buildPando,
  buildWrSolo,
  type PandoConditionalSpec,
  type ParityFixture,
  readPandoArtSet,
  readWrArtSet,
  type WrConditionalBag,
} from './harness'

const NOELLE_BASE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Noelle',
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
        location: 'Noelle',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const KEYS = [
  'ADayCarvedFromRisingWinds',
  'AubadeOfMorningstarAndMoon',
  'BlizzardStrayer',
  'BloodstainedChivalry',
  'BraveHeart',
  'CrimsonWitchOfFlames',
  'DisenchantmentInDeepShadow',
  'EchoesOfAnOffering',
] as const satisfies readonly ArtifactSetKey[]

/** WR cond on (4pc). Pando wearer conds use `dst: null`. */
const COND_ON: Record<
  (typeof KEYS)[number],
  { wr: WrConditionalBag; pando: PandoConditionalSpec }
> = {
  ADayCarvedFromRisingWinds: {
    wr: { ADayCarvedFromRisingWinds: { set4: 'on' } },
    pando: {
      sheet: 'ADayCarvedFromRisingWinds',
      src: '0',
      dst: null,
      name: 'set4',
      value: 1,
    },
  },
  AubadeOfMorningstarAndMoon: {
    wr: { AubadeOfMorningstarAndMoon: { set4: 'on' } },
    pando: {
      sheet: 'AubadeOfMorningstarAndMoon',
      src: '0',
      dst: null,
      name: 'set4',
      value: 1,
    },
  },
  BlizzardStrayer: {
    wr: { BlizzardStrayer: { state: 'cryo' } },
    pando: {
      sheet: 'BlizzardStrayer',
      src: '0',
      dst: null,
      name: 'state',
      value: 1,
    },
  },
  BloodstainedChivalry: {
    wr: { BloodstainedChivalry: { defeat: 'hit' } },
    pando: {
      sheet: 'BloodstainedChivalry',
      src: '0',
      dst: null,
      name: 'defeat',
      value: 1,
    },
  },
  BraveHeart: {
    wr: { BraveHeart: { hp: '50' } },
    pando: {
      sheet: 'BraveHeart',
      src: '0',
      dst: null,
      name: 'hp',
      value: 1,
    },
  },
  CrimsonWitchOfFlames: {
    wr: { CrimsonWitchOfFlames: { stack: '1' } },
    pando: {
      sheet: 'CrimsonWitchOfFlames',
      src: '0',
      dst: null,
      name: 'stack',
      value: 1,
    },
  },
  DisenchantmentInDeepShadow: {
    wr: { DisenchantmentInDeepShadow: { state: 'on' } },
    pando: {
      sheet: 'DisenchantmentInDeepShadow',
      src: '0',
      dst: null,
      name: 'state',
      value: 1,
    },
  },
  EchoesOfAnOffering: {
    wr: { EchoesOfAnOffering: { mode: 'on' } },
    pando: {
      sheet: 'EchoesOfAnOffering',
      src: '0',
      dst: null,
      name: 'mode',
      value: 1,
    },
  },
}

function withArts(
  key: ArtifactSetKey,
  n: number,
  extra: Partial<ParityFixture> = {}
): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  return {
    ...NOELLE_BASE,
    ...extra,
    members: [{ ...member, arts: artSetPieces(key, n) }],
  }
}

function assertCountAndFinals(
  fixture: ParityFixture,
  key: ArtifactSetKey,
  n: number
) {
  const wr = buildWrSolo(fixture)
  const pando = buildPando(fixture)
  expect(readWrArtSet(wr, key), `WR count n=${n}`).toBe(n)
  expect(readPandoArtSet(pando, key), `Pando count n=${n}`).toBe(n)
  assertFinals(wr, pando)
}

describe('artifact batch selfA WR ↔ Pando', () => {
  test.each(KEYS)('%s 0/2/4pc counts + finals (cond off)', (key) => {
    for (const n of [0, 2, 4] as const) {
      assertCountAndFinals(withArts(key, n), key, n)
    }
  })

  test.each(KEYS)('%s 4pc cond on', (key) => {
    const { wr, pando } = COND_ON[key]
    assertCountAndFinals(
      withArts(key, 4, {
        wrConditionals: wr,
        pandoConditionals: [pando],
      }),
      key,
      4
    )
  })
})
