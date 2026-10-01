import type {
  Field,
  MultiTagField,
  TagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { SkillKey } from '@genshin-optimizer/zzz/consts'
import type { CatalogJoinedRow } from './catalogListing'
import { TagTitle } from './components/TagTitle'
import { dimLabel } from './dimLabels'

export type AbilityFieldsBySkill = Partial<
  Record<SkillKey, Record<string, Field[]>>
>

export function catalogRowToField({
  reads,
}: CatalogJoinedRow): Field | undefined {
  const dim = reads.keys().next().value
  const titleTag = dim ? reads.get(dim)?.tag : undefined
  if (!titleTag) return undefined
  const title = <TagTitle tag={titleTag} />
  if (reads.size === 1) {
    const field: TagField = {
      title,
      fieldRef: titleTag,
    }
    return field
  }
  const fieldRefs: MultiTagField['fieldRefs'] = []
  for (const dim of reads.keys()) {
    const tag = reads.get(dim)?.tag
    if (!tag) return undefined
    fieldRefs.push({
      label: dimLabel(dim),
      ref: tag,
    })
  }
  const field: MultiTagField = {
    title,
    fieldRefs,
  }
  return field
}

export function abilityFieldsBySkillFromRows(
  rows: CatalogJoinedRow[]
): AbilityFieldsBySkill {
  const result: AbilityFieldsBySkill = {}
  for (const row of rows) {
    const { skill, abilityKey } = row.entry
    if (!skill || !abilityKey) continue
    const field = catalogRowToField(row)
    if (!field) continue
    result[skill] ??= {}
    result[skill][abilityKey] ??= []
    result[skill][abilityKey].push(field)
  }
  return result
}
