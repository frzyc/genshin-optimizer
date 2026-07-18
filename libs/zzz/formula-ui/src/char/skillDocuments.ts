import type { Document, Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { SkillKey } from '@genshin-optimizer/zzz/consts'
import type { AbilityFieldsBySkill } from './charFormulaFields'
import { isSkillAbilityTextDocument } from './sheetDocuments'

/** Insert render-time ability formula fields after each ability header text doc. */
export function injectAbilityFieldsIntoSkillDocuments(
  staticDocs: Document[],
  fieldsByAbility: Record<string, Field[]> | undefined
): Document[] {
  if (!fieldsByAbility) return staticDocs

  const result: Document[] = []
  for (const doc of staticDocs) {
    result.push(doc)
    if (!isSkillAbilityTextDocument(doc)) continue

    const fields = fieldsByAbility[doc.abilityKey]
    if (fields?.length) result.push({ type: 'fields', fields })
  }

  return result
}

export function injectAllAbilityFieldsIntoSkillDocuments(
  staticDocs: Document[],
  skill: SkillKey,
  abilityFieldsBySkill: AbilityFieldsBySkill
): Document[] {
  return injectAbilityFieldsIntoSkillDocuments(
    staticDocs,
    abilityFieldsBySkill[skill]
  )
}
