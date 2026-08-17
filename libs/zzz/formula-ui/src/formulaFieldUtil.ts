import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { TargetTag } from '@genshin-optimizer/zzz/db'
import {
  type AbilityDim,
  formulas,
  isAbilityDim,
  isDmgAbilityDim,
  listingId,
} from '@genshin-optimizer/zzz/formula'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import { isAbilityFormulaTag } from './abilityTag'

export function buildListingReadMap(
  reads: Read<Tag>[]
): Map<string, Read<Tag>> {
  const map = new Map<string, Read<Tag>>()
  for (const read of reads) {
    map.set(listingId(read.tag), read)
  }
  return map
}

/** Primary formula tag for grouping / labels (dmg ability dim of a bundled row). */
export function primaryTagFromField(field: Field): Tag | undefined {
  if (isMultiTagField(field)) {
    const dmgRef = field.fieldRefs.find((r) => isDmgAbilityDim(r.ref['q']))
    if (!dmgRef) {
      console.error(
        '[zzz-formula-ui] primaryTagFromField: bundled field missing dmg dim',
        { field }
      )
      return undefined
    }
    return dmgRef.ref
  }
  if (isTagField(field)) return field.fieldRef
  return undefined
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

/** Persisted `q` for a named formula row in the opt-target picker. */
export function optTargetQFromField(
  field: Field,
  currentTarget?: TargetTag,
  sheetFallback?: string
): string | undefined {
  const ref = primaryTagFromField(field)
  if (!ref) return undefined
  if (isMultiTagField(field) || isAbilityFormulaTag(ref)) {
    return abilityDimFromField(field, currentTarget, sheetFallback)
  }
  if (isTagField(field)) return field.fieldRef['q'] ?? undefined
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
  const seen = new Set(abilityTags.map(listingId))
  return reads
    .map((read) => read.tag)
    .filter((tag) => !isAbilityFormulaTag(tag) && !seen.has(listingId(tag)))
}
