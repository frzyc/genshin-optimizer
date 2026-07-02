import {
  type AbilityDim,
  type Tag,
  bundledFormulaInSheet,
  dmgAbilityDims,
} from '@genshin-optimizer/zzz/formula'

export const formulaDimensions = ['dmg', 'daze', 'anomBuildup'] as const
export type FormulaDimension = (typeof formulaDimensions)[number]

/** UI toggle bucket for each bundled ability dim. */
export const dimensionByAbilityDim = {
  standardDmg: 'dmg',
  sheerDmg: 'dmg',
  dazeBuildup: 'daze',
  anomBuildup: 'anomBuildup',
} as const satisfies Record<AbilityDim, FormulaDimension>

export function abilityDimsForDimension(
  dim: FormulaDimension
): readonly AbilityDim[] {
  if (dim === 'dmg') return dmgAbilityDims
  if (dim === 'daze') return ['dazeBuildup']
  return ['anomBuildup']
}

/** Pick ability dim for a dimension on an ability (e.g. standard vs sheer DMG). */
export function resolveAbilityDim(
  sheetFormulas: Record<string, { tag: Tag }> | undefined,
  baseName: string,
  dim: FormulaDimension
): AbilityDim | undefined {
  if (!sheetFormulas) return undefined
  for (const q of abilityDimsForDimension(dim)) {
    if (bundledFormulaInSheet(sheetFormulas, baseName, q)) return q
  }
  return undefined
}

/** Display labels for bundled ability dims (and dimension toggles). */
export const ABILITY_DIM_LABEL: Record<AbilityDim, string> = {
  standardDmg: 'DMG',
  sheerDmg: 'DMG',
  dazeBuildup: 'Daze',
  anomBuildup: 'Anom',
}

export function abilityDimLabel(q: AbilityDim): string {
  return ABILITY_DIM_LABEL[q]
}

/** UI bucket label — same as the canonical ability dim for that dimension. */
export function formulaDimensionLabel(dim: FormulaDimension): string {
  return ABILITY_DIM_LABEL[abilityDimsForDimension(dim)[0]]
}
