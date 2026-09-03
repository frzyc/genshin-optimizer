import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { FormulaSheet, Tag } from '@genshin-optimizer/zzz/formula'
import { formulaCatalog, STAT_SHEET } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it, vi } from 'vitest'
import {
  dimReadForDisplay,
  groupJoinedRows,
  joinCatalogRows,
  refFromJoinedRow,
} from './catalogListing'
import { abilityFieldsBySkillFromRows } from './catalogRowField'
import { skillAbilityTextDocument } from './char/sheetDocuments'
import { injectAllAbilityFieldsIntoSkillDocuments } from './char/skillDocuments'

vi.mock('@genshin-optimizer/common/util', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@genshin-optimizer/common/util')>()
  return {
    ...actual,
    shouldShowDevComponents: true,
  }
})

function readsFromCatalog(sheet: FormulaSheet, names: string[]): Read<Tag>[] {
  return names.flatMap((name) => {
    const entry = formulaCatalog[sheet]?.[name]
    if (!entry) return []
    return Object.values(entry.dims).map((tag) => ({ tag }) as Read<Tag>)
  })
}

describe('joinCatalogRows', () => {
  it('keeps normal and aftershock UltimateVoidstrike as separate catalog names', () => {
    const rows = joinCatalogRows(
      'Soldier0Anby',
      readsFromCatalog('Soldier0Anby', [
        'UltimateVoidstrike_0',
        'UltimateVoidstrike_aftershock0',
      ])
    )
    const names = new Set(rows.map((row) => row.entry.name))
    expect(names.has('UltimateVoidstrike_0')).toBe(true)
    expect(names.has('UltimateVoidstrike_aftershock0')).toBe(true)
  })

  it('groups both UltimateVoidstrike variants under chain', () => {
    const rows = joinCatalogRows(
      'Soldier0Anby',
      readsFromCatalog('Soldier0Anby', [
        'UltimateVoidstrike_0',
        'UltimateVoidstrike_aftershock0',
      ])
    )
    const bySkill = abilityFieldsBySkillFromRows(rows)
    expect(bySkill.chain?.UltimateVoidstrike?.length).toBe(2)
  })

  it('groups by catalog abilityKey, not the first underscore segment', () => {
    const bySkill = abilityFieldsBySkillFromRows([
      {
        entry: {
          sheet: 'Miyabi',
          name: 'SpecialAttackAzureFlash_Boundary_0',
          dims: {
            standardDmg: {
              sheet: 'Miyabi',
              name: 'SpecialAttackAzureFlash_Boundary_0',
              q: 'standardDmg',
            },
          },
          skill: 'special',
          abilityKey: 'SpecialAttackAzureFlash_Boundary',
          exposeInProd: false,
        },
        reads: new Map([
          [
            'standardDmg',
            {
              tag: {
                sheet: 'Miyabi',
                name: 'SpecialAttackAzureFlash_Boundary_0',
                q: 'standardDmg',
              },
            } as Read<Tag>,
          ],
        ]),
      },
    ])
    expect(bySkill.special?.SpecialAttackAzureFlash_Boundary).toBeDefined()
    expect(bySkill.special?.SpecialAttackAzureFlash).toBeUndefined()
  })
})

describe('groupJoinedRows', () => {
  it('puts stats in statRows and skill-stamped hits in talent sections', () => {
    const rows = joinCatalogRows('Anby', [
      ...readsFromCatalog(STAT_SHEET, ['atk']),
      ...readsFromCatalog('Anby', ['BasicAttackTurboVolt_0']),
    ])
    const { statRows, categorySections } = groupJoinedRows(rows)
    expect(statRows.some((row) => row.entry.name === 'atk')).toBe(true)
    expect(
      categorySections.some(
        (section) =>
          section.category === 'basic' &&
          section.rows.some(
            (row) => row.entry.name === 'BasicAttackTurboVolt_0'
          )
      )
    ).toBe(true)
  })
})

describe('dimReadForDisplay', () => {
  it('keeps the live listing attribute on dmg_ when it is not the opt target', () => {
    const entry = formulaCatalog[STAT_SHEET]!.dmg_
    const live: Tag = { ...entry.dims.final!, attribute: 'electric' }
    const shown = dimReadForDisplay(
      {
        entry,
        reads: new Map([['final', { tag: live } as Read<Tag>]]),
      },
      'final'
    )
    expect(shown?.tag.attribute).toBe('electric')
  })

  it('uses the opt-target overlay tag when this row is selected', () => {
    const entry = formulaCatalog[STAT_SHEET]!.dmg_
    const live: Tag = { ...entry.dims.final!, attribute: 'electric' }
    const read = {
      tag: live,
      withTag: (tag: Tag) => ({ tag, withTag: read.withTag }),
    } as Read<Tag>
    const shown = dimReadForDisplay(
      { entry, reads: new Map([['final', read]]) },
      'final',
      {
        sheet: STAT_SHEET,
        name: 'dmg_',
        dim: 'final',
        attribute: 'fire',
      }
    )
    expect(shown?.tag.attribute).toBe('fire')
  })
})

describe('refFromJoinedRow', () => {
  it('seeds dmg_ attribute from the live listing tag', () => {
    const entry = formulaCatalog[STAT_SHEET]!.dmg_
    const live: Tag = { ...entry.dims.final!, attribute: 'electric' }
    expect(
      refFromJoinedRow({
        entry,
        reads: new Map([['final', { tag: live } as Read<Tag>]]),
      })
    ).toMatchObject({
      sheet: STAT_SHEET,
      name: 'dmg_',
      dim: 'final',
      attribute: 'electric',
    })
  })
})

describe('injectAllAbilityFieldsIntoSkillDocuments', () => {
  it('inserts fields after the matching ability header doc', () => {
    const rows = joinCatalogRows(
      'Soldier0Anby',
      readsFromCatalog('Soldier0Anby', [
        'UltimateVoidstrike_0',
        'UltimateVoidstrike_aftershock0',
      ])
    )
    const bySkill = abilityFieldsBySkillFromRows(rows)
    const staticDocs = [
      skillAbilityTextDocument({
        abilityKey: 'UltimateVoidstrike',
        header: { icon: null, text: 'Ult' },
        text: 'desc',
      }),
    ]
    const injected = injectAllAbilityFieldsIntoSkillDocuments(
      staticDocs,
      'chain',
      bySkill
    )
    expect(injected).toHaveLength(2)
    expect(injected[1]?.type).toBe('fields')
  })
})
