import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { isDmgAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'

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

export function formulaMatchesAbility(
  formula: IFormulaData<Tag>,
  ability: string
): boolean {
  const base = (formula.tag.name ?? formula.name.split(':')[0]).split('_')[0]
  return base === ability
}
