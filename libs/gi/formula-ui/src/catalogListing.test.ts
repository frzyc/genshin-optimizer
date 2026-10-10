import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { FormulaSheet, Tag } from '@genshin-optimizer/gi/formula'
import {
  artifactsData,
  charData,
  enemyDebuff,
  formulaCatalog,
  genshinCalculatorWithEntries,
  isParamOnlyEntry,
  listingJoinId,
  lookupFormulaRef,
  own,
  ownBuff,
  STAT_SHEET,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import { describe, expect, it } from 'vitest'
import {
  groupJoinedRows,
  joinCatalogRows,
  dimReadForDisplay,
  listingReadForRef,
  refFromJoinedRow,
} from './catalogListing'

function readsFromCatalog(sheet: FormulaSheet, names: string[]): Read<Tag>[] {
  return names.flatMap((name) => {
    const entry = formulaCatalog[sheet]?.[name]
    if (!entry) return []
    return Object.values(entry.dims).map((tag) => ({ tag }) as Read<Tag>)
  })
}

describe('joinCatalogRows', () => {
  it('joins heal/shield/dmg and drops param-only kit constants', () => {
    const rows = joinCatalogRows('Noelle', [
      ...readsFromCatalog(STAT_SHEET, ['atk']),
      ...readsFromCatalog('Noelle', [
        'skill_heal',
        'skill_shield',
        'burst',
        'burst_cd',
        'skill_cd',
      ]),
    ])
    const names = new Set(rows.map((row) => row.entry.name))
    expect(names.has('atk')).toBe(true)
    expect(names.has('skill_heal')).toBe(true)
    expect(names.has('skill_shield')).toBe(true)
    expect(names.has('burst')).toBe(true)
    expect(names.has('burst_cd')).toBe(false)
    expect(names.has('skill_cd')).toBe(false)
    expect(isParamOnlyEntry(formulaCatalog.Noelle!.burst_cd!)).toBe(true)
  })
})

describe('groupJoinedRows', () => {
  it('puts stats in statRows and kit hits in talent sections', () => {
    const rows = joinCatalogRows('Noelle', [
      ...readsFromCatalog(STAT_SHEET, ['atk']),
      ...readsFromCatalog('Noelle', ['burst', 'skill_heal']),
    ])
    const { statRows, categorySections } = groupJoinedRows(rows)
    expect(statRows.some((row) => row.entry.name === 'atk')).toBe(true)
    expect(
      categorySections.some(
        (section) =>
          section.category === 'burst' &&
          section.rows.some((row) => row.entry.name === 'burst')
      )
    ).toBe(true)
    expect(
      categorySections.some(
        (section) =>
          section.category === 'skill' &&
          section.rows.some((row) => row.entry.name === 'skill_heal')
      )
    ).toBe(true)
  })
})

describe('refFromJoinedRow / listingReadForRef', () => {
  it('round-trips a joined row through FormulaRef back to the same Read', () => {
    const live = readsFromCatalog('Noelle', ['skill_heal'])
    const rows = joinCatalogRows('Noelle', live)
    const row = rows.find((r) => r.entry.name === 'skill_heal')
    expect(row).toBeDefined()
    const ref = refFromJoinedRow(row!)
    expect(ref).toEqual({
      sheet: 'Noelle',
      name: 'skill_heal',
      dim: 'heal',
    })
    expect(listingReadForRef(ref, rows)).toBe(row!.reads.get('heal'))
  })

  it('returns undefined for a dim that is not in the catalog', () => {
    const entry = formulaCatalog.Noelle!.skill_heal!
    expect(
      refFromJoinedRow({
        entry,
        reads: new Map([['notADim', { tag: entry.dims.heal! } as Read<Tag>]]),
      })
    ).toBeUndefined()
  })
})

describe('dimReadForDisplay', () => {
  it('returns every catalog dim independently so stats rows can show MultiTagField', () => {
    const entry = formulaCatalog.Noelle!.skill_heal!
    const heal = { tag: entry.dims.heal! } as Read<Tag>
    const shield = {
      tag: { ...entry.dims.heal!, q: 'shield' },
    } as Read<Tag>
    const row = {
      entry,
      reads: new Map([
        ['heal', heal],
        ['shield', shield],
      ]),
    }
    expect(dimReadForDisplay(row, 'heal')?.read).toBe(heal)
    expect(dimReadForDisplay(row, 'shield')?.read).toBe(shield)
    expect(dimReadForDisplay(row, 'dmg')).toBeUndefined()
  })
})

describe('live listFormulas join', () => {
  const char: ICharacter = {
    key: 'Noelle',
    level: 80,
    talent: { auto: 8, skill: 8, burst: 8 },
    ascension: 6,
    constellation: 6,
  }
  const weapon: IWeapon = {
    key: 'FavoniusGreatsword',
    level: 90,
    ascension: 6,
    refinement: 1,
    location: 'Noelle',
    lock: false,
  }
  const calc = genshinCalculatorWithEntries([
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData(char),
      ...weaponData(weapon),
      ...artifactsData([])
    ),
    enemyDebuff.reaction.cata.add(''),
    enemyDebuff.reaction.amp.add(''),
    enemyDebuff.common.lvl.add(90),
    enemyDebuff.common.preRes.add(0.1),
    ownBuff.common.critMode.add('avg'),
  ]).withTag({ src: '0' })

  it('joins live listings to catalog dims and round-trips FormulaRef', () => {
    const reads = calc.listFormulas(own.listing.formulas)
    const rows = joinCatalogRows('Noelle', reads)
    const names = new Set(rows.map((row) => row.entry.name))

    expect(names.has('skill_heal')).toBe(true)
    expect(names.has('skill_shield')).toBe(true)
    expect(names.has('burst')).toBe(true)
    expect(names.has('atk')).toBe(true)
    expect(names.has('burst_cd')).toBe(false)
    expect(names.has('skill_cd')).toBe(false)

    for (const row of rows) {
      for (const [dim, read] of row.reads) {
        expect(
          listingJoinId(read.tag),
          `${row.entry.sheet}/${row.entry.name}:${dim}`
        ).toBe(listingJoinId(row.entry.dims[dim]!))
      }
      const ref = refFromJoinedRow(row)
      expect(ref, `${row.entry.sheet}/${row.entry.name}`).toBeDefined()
      expect(listingReadForRef(ref, rows)).toBe(row.reads.get(ref!.dim))
    }
  })

  it('keeps register-time ele on skill/burst listings and omits it on infusion autos', () => {
    const listing = calc.listFormulas(own.listing.formulas)
    const burst = listing.find(
      (x) => x.tag.sheet === 'Noelle' && x.tag.name === 'burst'
    )
    const auto = listing.find(
      (x) => x.tag.sheet === 'Noelle' && x.tag.name === 'normal_0'
    )
    expect(burst?.tag.ele).toBe('geo')
    expect(auto?.tag.ele).toBeFalsy()
    expect(calc.compute(burst!).meta.tag?.ele).toBe('geo')
    expect(calc.compute(auto!).meta.tag?.ele).toBe('physical')

    const looked = lookupFormulaRef({
      sheet: 'Noelle',
      name: 'burst',
      dim: 'dmg',
    })
    expect(looked?.tag.ele).toBe('geo')
    expect(listingJoinId(burst!.tag)).toBe(listingJoinId(looked!.tag))
  })
})
