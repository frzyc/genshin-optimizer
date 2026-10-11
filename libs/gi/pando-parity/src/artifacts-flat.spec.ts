/**
 * Flat 2pc artifact batch (`flat`) WR ↔ Pando number-check.
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import {
  artSetPieces,
  assertFinals,
  buildPando,
  buildWrSolo,
  type FinalStat,
  type ParityFixture,
  readPandoArtSet,
  readPandoFinal,
  readWrArtSet,
  readWrFinal,
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

type Probe = {
  key: ArtifactSetKey
  pcs: readonly number[]
  moved?: FinalStat
}

const SETS: readonly Probe[] = [
  { key: 'PrayersForDestiny', pcs: [0, 2] },
  { key: 'PrayersForIllumination', pcs: [0, 2] },
  { key: 'PrayersForWisdom', pcs: [0, 2] },
  { key: 'PrayersToSpringtime', pcs: [0, 2] },
  { key: 'Adventurer', pcs: [0, 2], moved: 'hp' },
  { key: 'DefendersWill', pcs: [0, 2, 4], moved: 'def' },
  { key: 'EmblemOfSeveredFate', pcs: [0, 2, 4], moved: 'enerRech_' },
  { key: 'Gambler', pcs: [0, 2] },
  { key: 'LuckyDog', pcs: [0, 2], moved: 'def' },
  { key: 'OceanHuedClam', pcs: [0, 2, 4] },
  { key: 'ResolutionOfSojourner', pcs: [0, 2, 4], moved: 'atk' },
  { key: 'Scholar', pcs: [0, 2], moved: 'enerRech_' },
  { key: 'TheExile', pcs: [0, 2], moved: 'enerRech_' },
  { key: 'ThunderingFury', pcs: [0, 2, 4] },
  { key: 'TravelingDoctor', pcs: [0, 2, 4] },
  { key: 'GladiatorsFinale', pcs: [0, 2, 4], moved: 'atk' },
  { key: 'WanderersTroupe', pcs: [0, 2, 4], moved: 'eleMas' },
]

function withArts(key: ArtifactSetKey, n: number): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  return {
    ...NOELLE_BASE,
    members: [{ ...member, arts: artSetPieces(key, n) }],
  }
}

describe('flat artifact batch WR ↔ Pando', () => {
  test.each(
    SETS.flatMap(({ key, pcs }) => pcs.map((n) => [key, n] as const))
  )('%s %spc counts + 0pc-aligned finals', (key, n) => {
    const fixture = withArts(key, n)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    expect(readWrArtSet(wr, key), `WR count n=${n}`).toBe(n)
    expect(readPandoArtSet(pando, key), `Pando count n=${n}`).toBe(n)
    assertFinals(wr, pando)
  })

  test.each(
    SETS.filter((s) => s.moved).map((s) => [s.key, s.moved] as const)
  )('%s 2pc moves final %s on both engines', (key, stat) => {
    const wr0 = buildWrSolo(withArts(key, 0))
    const wr2 = buildWrSolo(withArts(key, 2))
    const pando0 = buildPando(withArts(key, 0))
    const pando2 = buildPando(withArts(key, 2))
    expect(readWrFinal(wr2, stat)).toBeGreaterThan(readWrFinal(wr0, stat))
    expect(readPandoFinal(pando2, stat)).toBeGreaterThan(
      readPandoFinal(pando0, stat)
    )
  })
})
