import type { TextDocument } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'

/** Skill ability header doc; `abilityKey` matches `mappedStats` / i18n ability id. */
export type SkillAbilityTextDocument = TextDocument & {
  abilityKey: string
}

export function skillAbilityTextDocument(
  doc: Omit<SkillAbilityTextDocument, 'type'>
): SkillAbilityTextDocument {
  return { type: 'text', ...doc }
}

export function isSkillAbilityTextDocument(
  doc: Document
): doc is SkillAbilityTextDocument {
  return (
    doc.type === 'text' &&
    'abilityKey' in doc &&
    typeof (doc as SkillAbilityTextDocument).abilityKey === 'string'
  )
}
