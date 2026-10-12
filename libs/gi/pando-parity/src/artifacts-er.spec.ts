/**
 * Artifact flat Energy Recharge WR ↔ Pando parity.
 *
 * Covers decimal parity fixtures, DB display-unit conversion (`artStatsFromDisplay`),
 * and WR `dataObjForArtifact` vs gi-frontend `CharCalcProvider` wiring (`cachedArts`).
 *
 *   yarn nx test gi-pando-parity --testPathPattern=artifacts-er
 */
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { getMainStatDisplayValue } from '@genshin-optimizer/gi/util'
import {
  artSetPieces,
  artStatsFromDisplay,
  assertFinals,
  buildPando,
  buildWrSolo,
  mapWrEnerRech,
  parityArtFromDisplay,
  type ParityFixture,
  readPandoFinal,
  readWrFinal,
} from './harness'
import { relDiff } from './relDiff'

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

const ER_SANDS_5STAR_20 = getMainStatDisplayValue('enerRech_', 5, 20)

function withMemberArts(
  arts: ParityFixture['members'][number]['arts']
): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  return { ...NOELLE_BASE, members: [{ ...member, arts }] }
}

function withCachedArts(cachedArts: ICachedArtifact[]): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  return { ...NOELLE_BASE, members: [{ ...member, cachedArts }] }
}

function erSandsCachedArt(): ICachedArtifact {
  return {
    id: 'parity-er-sands',
    setKey: 'Adventurer',
    slotKey: 'sands',
    mainStatKey: 'enerRech_',
    mainStatVal: ER_SANDS_5STAR_20,
    level: 20,
    rarity: 5,
    lock: false,
    location: 'Noelle',
    substats: [
      {
        key: 'critRate_',
        value: 3.9,
        accurateValue: 3.9,
        rolls: [3.9],
        efficiency: 1,
      },
    ],
    unactivatedSubstats: [],
  } as ICachedArtifact
}

describe('artifact flat enerRech_ WR ↔ Pando', () => {
  test('bare Noelle: WR total ER base maps to 0 Pando bonus', () => {
    const wr = buildWrSolo(NOELLE_BASE)
    const pando = buildPando(NOELLE_BASE)
    const wrTotal = readWrFinal(wr, 'enerRech_')
    const pandoBonus = readPandoFinal(pando, 'enerRech_')
    expect(wrTotal).toBeGreaterThan(1)
    expect(mapWrEnerRech(wrTotal)).toBeCloseTo(pandoBonus, 4)
    assertFinals(wr, pando, ['enerRech_'])
  })

  test('decimal ER sands + ER substat pieces assertFinals', () => {
    const fixture = withMemberArts([
      { set: 'Adventurer', stats: [{ key: 'enerRech_', value: 0.518 }] },
      {
        set: 'Adventurer',
        stats: [
          { key: 'hp', value: 239 },
          { key: 'enerRech_', value: 0.052 },
        ],
      },
    ])
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    expect(readWrFinal(wr, 'enerRech_')).toBeGreaterThan(
      readWrFinal(buildWrSolo(NOELLE_BASE), 'enerRech_')
    )
    assertFinals(wr, pando, ['enerRech_'])
  })

  test('display ER stats via artStatsFromDisplay assertFinals', () => {
    const fixture = withMemberArts([
      parityArtFromDisplay('Adventurer', [
        { key: 'enerRech_', display: ER_SANDS_5STAR_20 },
      ]),
      parityArtFromDisplay('Adventurer', [
        { key: 'hp', display: 239 },
        { key: 'enerRech_', display: 5.2 },
      ]),
    ])
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    const basePando = readPandoFinal(buildPando(NOELLE_BASE), 'enerRech_')
    expect(readPandoFinal(pando, 'enerRech_') - basePando).toBeCloseTo(
      0.518 + 0.052,
      4
    )
    assertFinals(wr, pando, ['enerRech_'])
  })

  test('Emblem 2pc + ER sands (decimal) assertFinals', () => {
    const fixture = withMemberArts([
      ...artSetPieces('EmblemOfSeveredFate', 2),
      { set: 'Adventurer', stats: [{ key: 'enerRech_', value: 0.518 }] },
    ])
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    const baseWr = buildWrSolo(NOELLE_BASE)
    const emblemWr = buildWrSolo(
      withMemberArts(artSetPieces('EmblemOfSeveredFate', 2))
    )
    expect(
      readWrFinal(wr, 'enerRech_') - readWrFinal(baseWr, 'enerRech_')
    ).toBeGreaterThan(
      readWrFinal(emblemWr, 'enerRech_') - readWrFinal(baseWr, 'enerRech_')
    )
    assertFinals(wr, pando, ['enerRech_'])
  })

  test('WR dataObjForArtifact matches Pando via cachedArts (gi-frontend path)', () => {
    const fixture = withCachedArts([erSandsCachedArt()])
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    const basePando = readPandoFinal(buildPando(NOELLE_BASE), 'enerRech_')
    expect(readPandoFinal(pando, 'enerRech_') - basePando).toBeCloseTo(0.518, 4)
    assertFinals(wr, pando, ['enerRech_'])
  })

  test('display units without toDecimal break WR ↔ Pando if used on Pando only', () => {
    const decimalFixture = withMemberArts([
      { set: 'Adventurer', stats: [{ key: 'enerRech_', value: 0.518 }] },
    ])
    const wrongPandoFixture = withMemberArts([
      {
        set: 'Adventurer',
        stats: artStatsFromDisplay([
          { key: 'enerRech_', display: ER_SANDS_5STAR_20 },
        ]).map((s) => ({ ...s, value: ER_SANDS_5STAR_20 })),
      },
    ])
    const wr = buildWrSolo(decimalFixture)
    const pandoOk = buildPando(decimalFixture)
    const pandoWrong = buildPando(wrongPandoFixture)
    expect(
      relDiff(
        mapWrEnerRech(readWrFinal(wr, 'enerRech_')),
        readPandoFinal(pandoOk, 'enerRech_')
      )
    ).toBeLessThan(1e-4)
    expect(
      relDiff(
        mapWrEnerRech(readWrFinal(wr, 'enerRech_')),
        readPandoFinal(pandoWrong, 'enerRech_')
      )
    ).toBeGreaterThan(0.5)
  })
})
