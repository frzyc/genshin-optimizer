import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import { describe, expect, it } from 'vitest'
import {
  filterDocumentsForTeamBuffs,
  isKitSheetSectionUnlocked,
  mergeConditionalDocumentsByKey,
} from './teamBuffDocuments'

const etherVeilMeta = {
  sheet: 'Lucia',
  name: 'etherVeil',
  type: 'bool' as const,
}

function condDoc(
  label: string,
  fields: { title: string; fieldRef: { sheet: string; name: string } }[]
): Document {
  return {
    type: 'conditional',
    conditional: {
      label,
      metadata: etherVeilMeta,
      fields: fields.map((field) => ({
        title: field.title,
        fieldRef: field.fieldRef,
      })),
    },
  }
}

describe('isKitSheetSectionUnlocked', () => {
  it('always unlocks non-mindscape sections', () => {
    expect(isKitSheetSectionUnlocked('core', 0)).toBe(true)
    expect(isKitSheetSectionUnlocked('special', 0)).toBe(true)
  })

  it('gates mN sections by mindscape', () => {
    expect(isKitSheetSectionUnlocked('m2', 1)).toBe(false)
    expect(isKitSheetSectionUnlocked('m2', 2)).toBe(true)
    expect(isKitSheetSectionUnlocked('m6', 5)).toBe(false)
    expect(isKitSheetSectionUnlocked('m6', 6)).toBe(true)
  })
})

describe('mergeConditionalDocumentsByKey', () => {
  it('merges same conditional key and unions unique team fields', () => {
    const docs: Document[] = [
      condDoc('Ether Veil', [
        {
          title: 'HP%',
          fieldRef: { sheet: 'Lucia', name: 'core_hp_' },
        },
      ]),
      condDoc('Ether Veil', [
        {
          title: 'Sheer',
          fieldRef: { sheet: 'Lucia', name: 'm2_sheer_dmg_' },
        },
      ]),
      condDoc('Ether Veil', [
        {
          title: 'HP% again',
          fieldRef: { sheet: 'Lucia', name: 'core_hp_' },
        },
      ]),
    ]

    const merged = mergeConditionalDocumentsByKey(docs)
    expect(merged).toHaveLength(1)
    expect(merged[0].type).toBe('conditional')
    if (merged[0].type !== 'conditional') return
    expect(merged[0].conditional.fields).toHaveLength(2)
    expect(
      merged[0].conditional.fields?.map((f) =>
        'fieldRef' in f ? f.fieldRef.name : undefined
      )
    ).toEqual(['core_hp_', 'm2_sheer_dmg_'])
  })
})

describe('filterDocumentsForTeamBuffs', () => {
  it('drops self-only fields then merges duplicate conditionals', () => {
    const docs: Document[] = [
      condDoc('Ether Veil', [
        {
          title: 'HP%',
          fieldRef: { sheet: 'Lucia', name: 'core_hp_' },
        },
      ]),
      condDoc('Ether Veil', [
        {
          title: 'Harmony self',
          fieldRef: { sheet: 'Lucia', name: 'm2_harmony_dmg_' },
        },
      ]),
      condDoc('Ether Veil', [
        {
          title: 'M6 self',
          fieldRef: { sheet: 'Lucia', name: 'm6_atk_' },
        },
      ]),
    ]

    const filtered = filterDocumentsForTeamBuffs(
      docs,
      new Set(['Lucia:core_hp_']),
      new Set(['Lucia:etherVeil']),
      6
    )

    expect(filtered).toHaveLength(1)
    expect(filtered[0].type).toBe('conditional')
    if (filtered[0].type !== 'conditional') return
    expect(filtered[0].conditional.fields).toHaveLength(1)
    const field = filtered[0].conditional.fields?.[0]
    expect(field && 'fieldRef' in field ? field.fieldRef.name : undefined).toBe(
      'core_hp_'
    )
  })
})
