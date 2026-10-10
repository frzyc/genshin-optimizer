/**
 * Artifact batch `teamA` WR ↔ Pando number-check.
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { enemy, own } from '@genshin-optimizer/gi/formula'
import { input } from '@genshin-optimizer/gi/wr'
import {
  artSetPieces,
  assertFinals,
  buildPando,
  buildWrSolo,
  type PandoConditionalSpec,
  type ParityFixture,
  readPandoArtSet,
  readPandoFinal,
  readWrArtSet,
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

const REL_TOL = 1e-4

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

function pandoCond(
  sheet: string,
  name: string,
  value: number
): PandoConditionalSpec {
  return { sheet, src: '0', dst: null, name, value }
}

function assertClose(wrVal: number, pandoVal: number, label: string): void {
  expect(Number.isFinite(wrVal), `WR ${label}`).toBe(true)
  expect(Number.isFinite(pandoVal), `Pando ${label}`).toBe(true)
  expect(
    relDiff(wrVal, pandoVal),
    `${label} wr=${wrVal} pando=${pandoVal}`
  ).toBeLessThan(REL_TOL)
}

function wrNode(
  wr: ReturnType<typeof buildWrSolo>,
  node: Parameters<ReturnType<typeof buildWrSolo>['get']>[0]
): number {
  return wr.get(node).value as number
}

describe('artifacts teamA WR ↔ Pando', () => {
  describe.each([
    'ArchaicPetra',
    'Berserker',
    'CelestialGift',
    'DeepwoodMemories',
    'DesertPavilionChronicle',
    'GildedDreams',
    'HeartOfTheFurnace',
  ] as const)('%s 0/2/4pc counts + finals', (key) => {
    test.each([0, 2, 4] as const)('%spc', (n) => {
      const fixture = withArts(key, n)
      const wr = buildWrSolo(fixture)
      const pando = buildPando(fixture)
      expect(readWrArtSet(wr, key), `WR count n=${n}`).toBe(n)
      expect(readPandoArtSet(pando, key), `Pando count n=${n}`).toBe(n)
      assertFinals(wr, pando)
    })
  })

  test('ArchaicPetra 2pc geo_dmg_ and 4pc element share', () => {
    const wr0 = buildWrSolo(withArts('ArchaicPetra', 0))
    const pando0 = buildPando(withArts('ArchaicPetra', 0))
    const wr2 = buildWrSolo(withArts('ArchaicPetra', 2))
    const pando2 = buildPando(withArts('ArchaicPetra', 2))
    assertClose(
      wrNode(wr2, input.total.geo_dmg_),
      pando2.compute(own.final.dmg_.geo).val as number,
      '2pc geo_dmg_'
    )
    expect(wrNode(wr2, input.total.geo_dmg_)).toBeGreaterThan(
      wrNode(wr0, input.total.geo_dmg_)
    )
    expect(pando2.compute(own.final.dmg_.geo).val).toBeGreaterThan(
      pando0.compute(own.final.dmg_.geo).val as number
    )

    const off = withArts('ArchaicPetra', 4)
    const on = withArts('ArchaicPetra', 4, {
      wrConditionals: { ArchaicPetra: { element: 'hydro' } },
      pandoConditionals: [pandoCond('ArchaicPetra', 'element', 1)],
    })
    const wrOff = buildWrSolo(off)
    const pandoOff = buildPando(off)
    const wrOn = buildWrSolo(on)
    const pandoOn = buildPando(on)
    assertFinals(wrOn, pandoOn)
    // WR teamBuff/nonStack is not visible in computeUIData; Pando addOnce is.
    expect(pandoOn.compute(own.final.dmg_.hydro).val).toBeCloseTo(
      (pandoOff.compute(own.final.dmg_.hydro).val as number) + 0.35,
      4
    )
    expect(wrNode(wrOff, input.total.hydro_dmg_)).toBeCloseTo(
      wrNode(wr0, input.total.hydro_dmg_)
    )
  })

  test('Berserker 2pc/4pc own critRate_ (hp=70)', () => {
    const wr0 = buildWrSolo(withArts('Berserker', 0))
    const wr2 = buildWrSolo(withArts('Berserker', 2))
    const pando0 = buildPando(withArts('Berserker', 0))
    const pando2 = buildPando(withArts('Berserker', 2))
    expect(readWrFinal(wr2, 'critRate_')).toBeGreaterThan(
      readWrFinal(wr0, 'critRate_')
    )
    expect(readPandoFinal(pando2, 'critRate_')).toBeGreaterThan(
      readPandoFinal(pando0, 'critRate_')
    )

    const off = withArts('Berserker', 4)
    const on = withArts('Berserker', 4, {
      wrConditionals: { Berserker: { hp: '70' } },
      pandoConditionals: [pandoCond('Berserker', 'hp', 1)],
    })
    const wrOff = buildWrSolo(off)
    const pandoOff = buildPando(off)
    const wrOn = buildWrSolo(on)
    const pandoOn = buildPando(on)
    assertFinals(wrOff, pandoOff)
    assertFinals(wrOn, pandoOn)
    expect(readWrFinal(wrOn, 'critRate_')).toBeGreaterThan(
      readWrFinal(wrOff, 'critRate_')
    )
    expect(readPandoFinal(pandoOn, 'critRate_')).toBeGreaterThan(
      readPandoFinal(pandoOff, 'critRate_')
    )
  })

  test('CelestialGift 2pc enerRech_ (4pc cond off without hexerei)', () => {
    const wr0 = buildWrSolo(withArts('CelestialGift', 0))
    const wr2 = buildWrSolo(withArts('CelestialGift', 2))
    const wr4 = buildWrSolo(withArts('CelestialGift', 4))
    const pando0 = buildPando(withArts('CelestialGift', 0))
    const pando2 = buildPando(withArts('CelestialGift', 2))
    const pando4 = buildPando(withArts('CelestialGift', 4))
    expect(readWrFinal(wr2, 'enerRech_')).toBeGreaterThan(
      readWrFinal(wr0, 'enerRech_')
    )
    expect(readPandoFinal(pando2, 'enerRech_')).toBeGreaterThan(
      readPandoFinal(pando0, 'enerRech_')
    )
    assertFinals(wr4, pando4)
    expect(readWrFinal(wr4, 'enerRech_')).toBeCloseTo(
      readWrFinal(wr2, 'enerRech_')
    )
    expect(readPandoFinal(pando4, 'enerRech_')).toBeCloseTo(
      readPandoFinal(pando2, 'enerRech_')
    )
  })

  test('DeepwoodMemories 2pc dendro_dmg_ and 4pc dendro preRes', () => {
    const wr0 = buildWrSolo(withArts('DeepwoodMemories', 0))
    const wr2 = buildWrSolo(withArts('DeepwoodMemories', 2))
    const pando0 = buildPando(withArts('DeepwoodMemories', 0))
    const pando2 = buildPando(withArts('DeepwoodMemories', 2))
    assertClose(
      wrNode(wr2, input.total.dendro_dmg_),
      pando2.compute(own.final.dmg_.dendro).val as number,
      '2pc dendro_dmg_'
    )
    expect(wrNode(wr2, input.total.dendro_dmg_)).toBeGreaterThan(
      wrNode(wr0, input.total.dendro_dmg_)
    )
    expect(pando2.compute(own.final.dmg_.dendro).val).toBeGreaterThan(
      pando0.compute(own.final.dmg_.dendro).val as number
    )

    const off = withArts('DeepwoodMemories', 4)
    const on = withArts('DeepwoodMemories', 4, {
      wrConditionals: { DeepwoodMemories: { set4: 'on' } },
      pandoConditionals: [pandoCond('DeepwoodMemories', 'set4', 1)],
    })
    const wrOff = buildWrSolo(off)
    const pandoOff = buildPando(off)
    const wrOn = buildWrSolo(on)
    const pandoOn = buildPando(on)
    assertFinals(wrOff, pandoOff)
    assertFinals(wrOn, pandoOn)
    // WR teamBuff dendro_enemyRes_ is not visible in computeUIData.
    expect(wrNode(wrOn, input.total.dendro_enemyRes_)).toBeCloseTo(
      wrNode(wrOff, input.total.dendro_enemyRes_)
    )
    const pandoDelta =
      (pandoOn.compute(enemy.common.preRes.dendro).val as number) -
      (pandoOff.compute(enemy.common.preRes.dendro).val as number)
    expect(pandoDelta).toBeCloseTo(-0.3)
  })

  test('DesertPavilionChronicle 2pc anemo_dmg_ and 4pc NA/CA/plunge', () => {
    const wr0 = buildWrSolo(withArts('DesertPavilionChronicle', 0))
    const wr2 = buildWrSolo(withArts('DesertPavilionChronicle', 2))
    const pando0 = buildPando(withArts('DesertPavilionChronicle', 0))
    const pando2 = buildPando(withArts('DesertPavilionChronicle', 2))
    assertClose(
      wrNode(wr2, input.total.anemo_dmg_),
      pando2.compute(own.final.dmg_.anemo).val as number,
      '2pc anemo_dmg_'
    )
    expect(wrNode(wr2, input.total.anemo_dmg_)).toBeGreaterThan(
      wrNode(wr0, input.total.anemo_dmg_)
    )
    expect(pando2.compute(own.final.dmg_.anemo).val).toBeGreaterThan(
      pando0.compute(own.final.dmg_.anemo).val as number
    )

    const off = withArts('DesertPavilionChronicle', 4)
    const on = withArts('DesertPavilionChronicle', 4, {
      wrConditionals: { DesertPavilionChronicle: { set4: 'on' } },
      pandoConditionals: [pandoCond('DesertPavilionChronicle', 'set4', 1)],
    })
    const wrOff = buildWrSolo(off)
    const pandoOff = buildPando(off)
    const wrOn = buildWrSolo(on)
    const pandoOn = buildPando(on)
    assertFinals(wrOn, pandoOn)
    for (const [wrStat, pandoRead] of [
      [input.total.normal_dmg_, own.final.dmg_.normal],
      [input.total.charged_dmg_, own.final.dmg_.charged],
      [input.total.plunging_dmg_, own.final.dmg_.plunging],
    ] as const) {
      assertClose(
        wrNode(wrOff, wrStat),
        pandoOff.compute(pandoRead).val as number,
        `4pc ${wrStat} off`
      )
      assertClose(
        wrNode(wrOn, wrStat),
        pandoOn.compute(pandoRead).val as number,
        `4pc ${wrStat} on`
      )
      expect(wrNode(wrOn, wrStat)).toBeGreaterThan(wrNode(wrOff, wrStat))
      expect(pandoOn.compute(pandoRead).val).toBeGreaterThan(
        pandoOff.compute(pandoRead).val as number
      )
    }
  })

  test('GildedDreams 2pc EM and 4pc override ATK/EM', () => {
    const wr0 = buildWrSolo(withArts('GildedDreams', 0))
    const wr2 = buildWrSolo(withArts('GildedDreams', 2))
    const pando0 = buildPando(withArts('GildedDreams', 0))
    const pando2 = buildPando(withArts('GildedDreams', 2))
    expect(readWrFinal(wr2, 'eleMas')).toBeGreaterThan(
      readWrFinal(wr0, 'eleMas')
    )
    expect(readPandoFinal(pando2, 'eleMas')).toBeGreaterThan(
      readPandoFinal(pando0, 'eleMas')
    )

    const off = withArts('GildedDreams', 4)
    const on = withArts('GildedDreams', 4, {
      wrConditionals: {
        GildedDreams: { passive: 'on', overrideSame: '3', overrideOther: '2' },
      },
      pandoConditionals: [
        pandoCond('GildedDreams', 'passive', 1),
        pandoCond('GildedDreams', 'overrideSame', 4),
        pandoCond('GildedDreams', 'overrideOther', 3),
      ],
    })
    const wrOff = buildWrSolo(off)
    const pandoOff = buildPando(off)
    const wrOn = buildWrSolo(on)
    const pandoOn = buildPando(on)
    assertFinals(wrOff, pandoOff)
    assertFinals(wrOn, pandoOn)
    expect(readWrFinal(wrOn, 'atk')).toBeGreaterThan(readWrFinal(wrOff, 'atk'))
    expect(readPandoFinal(pandoOn, 'atk')).toBeGreaterThan(
      readPandoFinal(pandoOff, 'atk')
    )
    expect(readWrFinal(wrOn, 'eleMas')).toBeGreaterThan(
      readWrFinal(wrOff, 'eleMas')
    )
    expect(readPandoFinal(pandoOn, 'eleMas')).toBeGreaterThan(
      readPandoFinal(pandoOff, 'eleMas')
    )
  })

  test('HeartOfTheFurnace 2pc/4pc ATK and 4pc stellar dmg_', () => {
    const wr0 = buildWrSolo(withArts('HeartOfTheFurnace', 0))
    const wr2 = buildWrSolo(withArts('HeartOfTheFurnace', 2))
    const pando0 = buildPando(withArts('HeartOfTheFurnace', 0))
    const pando2 = buildPando(withArts('HeartOfTheFurnace', 2))
    expect(readWrFinal(wr2, 'atk')).toBeGreaterThan(readWrFinal(wr0, 'atk'))
    expect(readPandoFinal(pando2, 'atk')).toBeGreaterThan(
      readPandoFinal(pando0, 'atk')
    )

    const off = withArts('HeartOfTheFurnace', 4)
    const on = withArts('HeartOfTheFurnace', 4, {
      wrConditionals: { HeartOfTheFurnace: { '4Stellar': 'on' } },
      pandoConditionals: [pandoCond('HeartOfTheFurnace', '4Stellar', 1)],
    })
    const wrOff = buildWrSolo(off)
    const pandoOff = buildPando(off)
    const wrOn = buildWrSolo(on)
    const pandoOn = buildPando(on)
    assertFinals(wrOn, pandoOn)
    expect(readWrFinal(wrOn, 'atk')).toBeGreaterThan(readWrFinal(wrOff, 'atk'))
    expect(readPandoFinal(pandoOn, 'atk')).toBeGreaterThan(
      readPandoFinal(pandoOff, 'atk')
    )
    // WR teamBuff/nonStack is not visible in computeUIData; Pando addOnce is.
    expect(pandoOn.compute(own.final.dmg_.stellarconduct).val).toBeCloseTo(
      0.5,
      4
    )
    expect(pandoOn.compute(own.final.dmg_.stellarswirl).val).toBeCloseTo(0.5, 4)
    expect(pandoOff.compute(own.final.dmg_.stellarconduct).val).toBeCloseTo(
      0,
      4
    )
  })
})
