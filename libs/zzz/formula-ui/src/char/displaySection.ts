import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type { Document, Field } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import { type Sheet, type Tag, formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  formulaMatchesAbility,
  primaryTagFromField,
} from '../bundledFormulaFields'

export type DisplaySection = SkillKey | 'exSpecial' | 'ult' | 'aftershock'

export const DISPLAY_SECTION_ORDER: readonly DisplaySection[] = [
  ...allSkillKeys,
  'exSpecial',
  'ult',
  'aftershock',
]

export type AbilitySectionOverrides = Partial<
  Record<SkillKey, Partial<Record<string, DisplaySection>>>
>

export type CharSheetLayoutOpts = {
  abilitySection?: AbilitySectionOverrides
  perSkillAbility?: Partial<
    Record<SkillKey, Partial<Record<string, Document[]>>>
  >
}

// e.g. "Anby:BasicAttackTurboVolt_0" -> "basic"
export type FormulaSectionIndex = Map<string, DisplaySection>

export function formulaTagKey(tag: Tag): string {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}`
}

export function inferSectionFromFormulas(
  matched: IFormulaData<Tag>[]
): DisplaySection | undefined {
  for (const f of matched) {
    const dt = f.tag.damageType1
    if (dt === 'ult' || dt === 'exSpecial' || dt === 'aftershock') return dt
  }
  return undefined
}

export function resolveAbilityDisplaySection(
  skill: SkillKey,
  ability: string,
  matched: IFormulaData<Tag>[],
  overrides?: AbilitySectionOverrides
): DisplaySection {
  return (
    overrides?.[skill]?.[ability] ?? inferSectionFromFormulas(matched) ?? skill
  )
}

function withCharSheet(tag: Tag, charKey: CharacterKey): Tag {
  return tag.sheet ? tag : { ...tag, sheet: charKey as Sheet }
}

function tagsFromField(field: Field): Tag[] {
  if (isMultiTagField(field)) return field.fieldRefs.map((r) => r.ref)
  if (isTagField(field)) return [field.fieldRef]
  return []
}

function tagsFromFields(fields: Field[]): Tag[] {
  return fields.flatMap(tagsFromField)
}

function tagsFromDocuments(docs: Document[]): Tag[] {
  const tags: Tag[] = []
  for (const doc of docs) {
    if (doc.type === 'fields') tags.push(...tagsFromFields(doc.fields))
    if (doc.type === 'conditional' && doc.conditional.fields)
      tags.push(...tagsFromFields(doc.conditional.fields))
  }
  return tags
}

function registerTags(
  index: FormulaSectionIndex,
  section: DisplaySection,
  tags: Tag[],
  charKey: CharacterKey
) {
  for (const tag of tags) {
    index.set(formulaTagKey(withCharSheet(tag, charKey)), section)
  }
}

export function registerAbilityLayout(
  index: FormulaSectionIndex,
  section: DisplaySection,
  matched: IFormulaData<Tag>[],
  charKey: CharacterKey,
  addlDocs: Document[] = []
) {
  registerTags(
    index,
    section,
    matched.map((f) =>
      withCharSheet(
        { ...f.tag, sheet: (f.tag.sheet ?? f.sheet ?? charKey) as Sheet },
        charKey
      )
    ),
    charKey
  )
  registerTags(index, section, tagsFromDocuments(addlDocs), charKey)
}

export function buildCharFormulaSectionIndex(
  charKey: CharacterKey,
  layout: CharSheetLayoutOpts = {}
): FormulaSectionIndex {
  const index: FormulaSectionIndex = new Map()
  const dm = mappedStats.char[charKey]
  const form = formulas[charKey] as Record<string, IFormulaData<Tag>>

  for (const skill of allSkillKeys) {
    for (const ability of Object.keys(dm[skill])) {
      const matched = Object.values(form).filter((f) =>
        formulaMatchesAbility(f, ability)
      )
      const section = resolveAbilityDisplaySection(
        skill,
        ability,
        matched,
        layout.abilitySection
      )
      const addlDocs = layout.perSkillAbility?.[skill]?.[ability] ?? []
      registerAbilityLayout(index, section, matched, charKey, addlDocs)
    }
  }

  return index
}

// A lookup table that caches the section index for each character.
const charSectionIndices = new Map<CharacterKey, FormulaSectionIndex>()

export function setCharFormulaSectionIndex(
  charKey: CharacterKey,
  index: FormulaSectionIndex
) {
  charSectionIndices.set(charKey, index)
}

export function getCharFormulaSectionIndex(
  charKey: CharacterKey
): FormulaSectionIndex | undefined {
  return charSectionIndices.get(charKey)
}

export function getFormulaDisplaySection(
  charKey: CharacterKey,
  tag: Tag
): DisplaySection | undefined {
  return charSectionIndices
    .get(charKey)
    ?.get(formulaTagKey(withCharSheet(tag, charKey)))
}

export function groupFieldsByDisplaySection(
  charKey: CharacterKey,
  fields: Field[]
): { bySection: Map<string, Field[]>; other: Field[] } {
  const bySection = new Map<string, Field[]>()
  const other: Field[] = []

  for (const field of fields) {
    const tag = primaryTagFromField(field)
    const section = tag ? getFormulaDisplaySection(charKey, tag) : undefined
    if (section) {
      const list = bySection.get(section) ?? []
      list.push(field)
      bySection.set(section, list)
    } else {
      other.push(field)
    }
  }

  return { bySection, other }
}

export function orderedDisplaySections(
  bySection: Map<string, Field[]>
): Array<{ section: DisplaySection; fields: Field[] }> {
  const seen = new Set<string>()
  const sections: Array<{ section: DisplaySection; fields: Field[] }> = []

  for (const section of DISPLAY_SECTION_ORDER) {
    const fields = bySection.get(section)
    if (!fields?.length) continue
    seen.add(section)
    sections.push({ section, fields })
  }
  for (const [section, fields] of bySection) {
    if (seen.has(section) || !fields.length) continue
    sections.push({ section: section as DisplaySection, fields })
  }

  return sections
}
