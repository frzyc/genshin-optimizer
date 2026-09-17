import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { formulas, isDmgAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import { isAbilityFormulaTag } from './abilityTag'

/** Stable key for deduping / looking up listing formula tags. */
export function formulaListingTagKey(tag: Tag): string {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}:${tag.q ?? ''}:${tag.qt ?? ''}:${tag.attribute ?? ''}:${tag.damageType1 ?? ''}:${tag.damageType2 ?? ''}`
}

export function buildListingReadMap(
  reads: Read<Tag>[]
): Map<string, Read<Tag>> {
  const map = new Map<string, Read<Tag>>()
  for (const read of reads) {
    map.set(formulaListingTagKey(read.tag), read)
  }
  return map
}

/** Primary formula tag for grouping / labels (dmg ability dim of a bundled row). */
export function primaryTagFromField(field: Field): Tag | undefined {
  if (isMultiTagField(field)) {
    return (
      field.fieldRefs.find((r) => isDmgAbilityDim(r.ref['q']))?.ref ??
      field.fieldRefs[0]?.ref
    )
  }
  if (isTagField(field)) return field.fieldRef
  return undefined
}

function charFormulaMetaTag(
  formula: IFormulaData<Tag>,
  charKey: CharacterKey
): Tag {
  return {
    ...formula.tag,
    sheet: (formula.tag.sheet ?? formula.sheet ?? charKey) as Sheet,
    name: formula.tag.name ?? formula.name.split(':')[0],
  }
}

/** All ability hit tags from static formula meta (ignores live conditional gating). */
export function charAbilityFormulaTags(charKey: CharacterKey): Tag[] {
  const sheetFormulas = formulas[charKey] as Record<string, IFormulaData<Tag>>
  return Object.values(sheetFormulas)
    .map((formula) => charFormulaMetaTag(formula, charKey))
    .filter(isAbilityFormulaTag)
}

/** Non-ability formula tags from live calc listing not already in static meta. */
export function listExtraOptFieldTags(
  reads: Read<Tag>[],
  abilityTags: Tag[]
): Tag[] {
  const seen = new Set(abilityTags.map(formulaListingTagKey))
  return reads
    .map((read) => read.tag)
    .filter(
      (tag) => !isAbilityFormulaTag(tag) && !seen.has(formulaListingTagKey(tag))
    )
}
