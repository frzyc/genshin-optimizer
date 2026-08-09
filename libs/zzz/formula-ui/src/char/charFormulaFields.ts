import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { parseAbilityFromTag, skillFromTag } from '../abilityTag'
import { groupFieldsByTag } from '../bundledFormulaFields'
import {
  buildListingReadMap,
  charAbilityFormulaTags,
  listExtraOptFieldTags,
} from '../formulaFieldUtil'

export type AbilityFieldsBySkill = Partial<
  Record<SkillKey, Record<string, Field[]>>
>

function flattenAbilityFieldsBySkill(bySkill: AbilityFieldsBySkill): Field[] {
  const fields: Field[] = []
  for (const skill of allSkillKeys) {
    const byAbility = bySkill[skill]
    if (!byAbility) continue
    for (const abilityFields of Object.values(byAbility)) {
      fields.push(...abilityFields)
    }
  }
  return fields
}

/** Group static ability tags into bundled fields per skill tab and ability key. */
export function buildAbilityFieldsBySkill(
  charKey: CharacterKey,
  abilityTags: Tag[]
): AbilityFieldsBySkill {
  const result: AbilityFieldsBySkill = {}

  for (const skill of allSkillKeys) {
    const skillTags = abilityTags.filter((tag) => skillFromTag(tag) === skill)
    if (!skillTags.length) continue

    const abilityKeys = new Set(
      skillTags
        .map((tag) => parseAbilityFromTag(tag)?.abilityKey)
        .filter((key): key is string => !!key)
    )

    const fieldsByAbility: Record<string, Field[]> = {}
    for (const abilityKey of abilityKeys) {
      const tags = skillTags.filter(
        (tag) => parseAbilityFromTag(tag)?.abilityKey === abilityKey
      )
      const fields = groupFieldsByTag(tags, { charKey, skill })
      if (fields.length) fieldsByAbility[abilityKey] = fields
    }

    if (Object.keys(fieldsByAbility).length) result[skill] = fieldsByAbility
  }

  return result
}

/** Pure field builder shared by optimize stats and character mechanics. */
export function buildCharFormulaFields(
  charKey: CharacterKey,
  reads: Read<Tag>[]
) {
  const abilityFormulaTags = charAbilityFormulaTags(charKey)
  const abilityFieldsBySkill = buildAbilityFieldsBySkill(
    charKey,
    abilityFormulaTags
  )
  const extraTags = listExtraOptFieldTags(reads, abilityFormulaTags)

  return {
    reads,
    fields: [
      ...flattenAbilityFieldsBySkill(abilityFieldsBySkill),
      ...groupFieldsByTag(extraTags, { sheet: charKey, charKey }),
    ],
    readByListingKey: buildListingReadMap(reads),
    abilityFieldsBySkill,
  }
}
