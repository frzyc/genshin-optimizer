import { ColorText } from '@genshin-optimizer/common/ui'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type {
  Field,
  MultiTagField,
  TagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import type { TargetTag } from '@genshin-optimizer/zzz/db'
import { type AbilityDim, isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import { skillFromTag } from './abilityTag'
import {
  partitionBundlableTags,
  resolveBundleDmgQ,
} from './bundledFormulaGrouping'
import { abilityTagDisplay } from './char/abilityFormulaLabels'
import { getVariant } from './char/util'
import { ABILITY_DIM_LABEL } from './formulaDimensionUi'
import { primaryTagFromField } from './formulaFieldUtil'
import { tagToTagField } from './util'

export { primaryTagFromField } from './formulaFieldUtil'

function abilityFieldTitle(charKey: CharacterKey, skill: SkillKey, tag: Tag) {
  return abilityTagDisplay(charKey, tag, skill) ?? tag.name ?? tag.q ?? ''
}

function bundleFieldRefs(byQ: Map<string, Tag>) {
  const dmgQ = resolveBundleDmgQ(byQ)!
  return [
    { label: ABILITY_DIM_LABEL[dmgQ], ref: byQ.get(dmgQ)! },
    { label: ABILITY_DIM_LABEL.dazeBuildup, ref: byQ.get('dazeBuildup')! },
    { label: ABILITY_DIM_LABEL.anomBuildup, ref: byQ.get('anomBuildup')! },
  ]
}

function singleFormulaField(
  tag: Tag,
  charKey: CharacterKey | undefined,
  skill: SkillKey | undefined
): TagField {
  if (charKey && skill) {
    return {
      title: (
        <ColorText color={getVariant(tag)}>
          {abilityFieldTitle(charKey, skill, tag)}
        </ColorText>
      ),
      fieldRef: tag,
    }
  }
  return tagToTagField(tag, { preventRecursion: true }) as TagField
}

type GroupFieldsOpts = {
  sheet?: Sheet
  charKey?: CharacterKey
  skill?: SkillKey
}

/**
 * Groups tags that share `name` with dmg/daze/anom `q` into one {@link MultiTagField}.
 */
export function groupFieldsByTag(
  tags: Tag[],
  opts: GroupFieldsOpts = {}
): Field[] {
  const { sheet, charKey, skill } = opts

  const bundledTitle = (tag: Tag) => {
    const resolvedSkill = skill ?? skillFromTag(tag)
    if (charKey && resolvedSkill) {
      return (
        <ColorText color={getVariant(tag)}>
          {abilityFieldTitle(charKey, resolvedSkill, tag)}
        </ColorText>
      )
    }
    return tagToTagField(tag, { preventRecursion: true }).title
  }

  const fields: Field[] = []

  for (const part of partitionBundlableTags(tags, sheet)) {
    if (part.kind === 'single') {
      fields.push(singleFormulaField(part.tag, charKey, skill))
      continue
    }

    const dmgTag = part.byQ.get(part.dmgQ)!
    const titleField = tagToTagField(dmgTag, { preventRecursion: true })
    const multiField: MultiTagField = {
      title: bundledTitle(dmgTag),
      icon: titleField.icon,
      subtitle: titleField.subtitle,
      fieldRefs: bundleFieldRefs(part.byQ),
    }
    fields.push(multiField)
  }

  return fields
}

export function groupFormulas(
  reads: Read<Tag>[],
  sheet?: Sheet,
  charKey?: CharacterKey
): Field[] {
  return groupFieldsByTag(
    reads.map((r) => r.tag),
    { sheet, charKey }
  )
}

/** Skill sheet / mechanics fields from formula meta (e.g. bundled Miyabi). */
export function groupFormulaMetaToFields(
  formulas: IFormulaData<Tag>[],
  charKey: CharacterKey,
  skill: SkillKey
): Field[] {
  const tags = formulas.map((f) => ({
    ...f.tag,
    sheet: (f.tag.sheet ?? f.sheet ?? charKey) as Sheet,
  }))
  return groupFieldsByTag(tags, { sheet: charKey, charKey, skill })
}

/** Resolve bundled ability dim for an opt-target field row. */
export function abilityDimFromField(
  field: Field,
  currentTarget?: TargetTag,
  sheetFallback?: string
): AbilityDim | undefined {
  const ref = primaryTagFromField(field)
  if (!ref?.name) return undefined
  const sheet = ref.sheet ?? sheetFallback
  const targetSheet = currentTarget?.sheet ?? sheetFallback
  if (
    currentTarget?.name === ref.name &&
    targetSheet === sheet &&
    currentTarget.q &&
    isAbilityDim(currentTarget.q)
  )
    return currentTarget.q
  if (isAbilityDim(ref.q)) return ref.q
  return undefined
}
