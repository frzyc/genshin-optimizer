import type { Document, Field } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import { formulas } from '@genshin-optimizer/zzz/formula'
import { isAbilityFormulaTag, skillFromTag } from '../abilityTag'
import { formulaFieldGroupKey } from '../bundledFormulaGrouping'
import { primaryTagFromField } from '../formulaFieldUtil'
import { type TalentSheetElementKey, allTalentSheetElementKey } from './consts'
import { charSheets } from './sheets'

export type { TalentSheetElementKey }
export const FIELD_CATEGORY_ORDER = allTalentSheetElementKey

export type FieldCategoryIndex = Map<string, TalentSheetElementKey>

function withCharSheet(tag: Tag, charKey: CharacterKey): Tag {
  return tag.sheet ? tag : { ...tag, sheet: charKey as Sheet }
}

function tagsFromField(field: Field): Tag[] {
  if (isMultiTagField(field)) return field.fieldRefs.map((r) => r.ref)
  if (isTagField(field)) return [field.fieldRef]
  return []
}

function tagsFromDocuments(docs: Document[]): Tag[] {
  const tags: Tag[] = []
  for (const doc of docs) {
    if (doc.type === 'fields')
      tags.push(...doc.fields.flatMap((field) => tagsFromField(field)))
    if (doc.type === 'conditional' && doc.conditional.fields)
      tags.push(
        ...doc.conditional.fields.flatMap((field) => tagsFromField(field))
      )
  }
  return tags
}

/** Ability hits from static formula meta → skill tab (basic, chain, …). */
function indexAbilityFormulaCategories(
  charKey: CharacterKey,
  index: FieldCategoryIndex
) {
  const sheetFormulas = formulas[charKey] as Record<string, { tag: Tag }>
  for (const formula of Object.values(sheetFormulas)) {
    const tag = withCharSheet(formula.tag, charKey)
    if (!isAbilityFormulaTag(tag)) continue
    const skill = skillFromTag(tag)
    if (!skill) continue
    index.set(formulaFieldGroupKey(tag), skill)
  }
}

/** Buff / conditional fields still embedded in static CharUISheet docs. */
function indexStaticSheetBuffCategories(
  charKey: CharacterKey,
  index: FieldCategoryIndex
) {
  const uiSheet = charSheets[charKey]
  if (!uiSheet) return

  for (const category of allTalentSheetElementKey) {
    const element = uiSheet[category]
    if (!element?.documents.length) continue
    for (const tag of tagsFromDocuments(element.documents)) {
      const withSheet = withCharSheet(tag, charKey)
      if (isAbilityFormulaTag(withSheet)) continue
      index.set(formulaFieldGroupKey(withSheet), category)
    }
  }
}

/** Index formula tags by talent tab for opt-target grouping. */
export function buildFieldCategoryIndex(
  charKey: CharacterKey
): FieldCategoryIndex {
  const index: FieldCategoryIndex = new Map()
  indexAbilityFormulaCategories(charKey, index)
  indexStaticSheetBuffCategories(charKey, index)
  return index
}

const categoryIndices = new Map<CharacterKey, FieldCategoryIndex>()

export function getOrBuildCategoryIndex(
  charKey: CharacterKey
): FieldCategoryIndex {
  const cached = categoryIndices.get(charKey)
  if (cached) return cached
  const index = buildFieldCategoryIndex(charKey)
  categoryIndices.set(charKey, index)
  return index
}

export function getFieldCategory(
  charKey: CharacterKey,
  tag: Tag,
  index: FieldCategoryIndex = getOrBuildCategoryIndex(charKey)
): TalentSheetElementKey | undefined {
  return index.get(formulaFieldGroupKey(withCharSheet(tag, charKey)))
}

export function groupFieldsByCategory(
  charKey: CharacterKey,
  fields: Field[],
  index: FieldCategoryIndex = getOrBuildCategoryIndex(charKey)
): { byCategory: Map<string, Field[]>; other: Field[] } {
  const byCategory = new Map<string, Field[]>()
  const other: Field[] = []

  for (const field of fields) {
    const tag = primaryTagFromField(field)
    const category = tag ? getFieldCategory(charKey, tag, index) : undefined
    if (category) {
      const list = byCategory.get(category) ?? []
      list.push(field)
      byCategory.set(category, list)
    } else {
      other.push(field)
    }
  }

  return { byCategory, other }
}

export function orderedFieldCategories(
  byCategory: Map<string, Field[]>
): Array<{ category: TalentSheetElementKey; fields: Field[] }> {
  const seen = new Set<string>()
  const sections: Array<{
    category: TalentSheetElementKey
    fields: Field[]
  }> = []

  for (const category of FIELD_CATEGORY_ORDER) {
    const fields = byCategory.get(category)
    if (!fields?.length) continue
    seen.add(category)
    sections.push({ category, fields })
  }
  for (const [category, fields] of byCategory) {
    if (seen.has(category) || !fields.length) continue
    sections.push({ category: category as TalentSheetElementKey, fields })
  }

  return sections
}
