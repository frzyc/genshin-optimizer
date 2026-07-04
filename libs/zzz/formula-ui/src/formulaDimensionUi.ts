import type { TargetTag } from '@genshin-optimizer/zzz/db'
import {
  type AbilityDim,
  type Tag,
  bundledFormulaInSheet,
  dmgAbilityDims,
  isAbilityDim,
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

/** Short labels on bundled stat rows (DMG / Daze / Anom). */
export const ABILITY_DIM_LABEL: Record<AbilityDim, string> = {
  standardDmg: 'DMG',
  sheerDmg: 'DMG',
  dazeBuildup: 'Daze',
  anomBuildup: 'Anom',
}

/** Dimension toggle labels in the optimize opt-target row. */
const FORMULA_DIMENSION_LABEL: Record<FormulaDimension, string> = {
  dmg: 'DMG',
  daze: 'Daze',
  anomBuildup: 'Anomaly Buildup',
}

export function abilityDimLabel(q: AbilityDim): string {
  return ABILITY_DIM_LABEL[q]
}

export function formulaDimensionLabel(dim: FormulaDimension): string {
  return FORMULA_DIMENSION_LABEL[dim]
}

/** Longer labels in formula breakdown tooltips. */
export function abilityDimTooltipLabel(q: AbilityDim): string {
  const dim = dimensionByAbilityDim[q]
  if (dim === 'anomBuildup') return formulaDimensionLabel('anomBuildup')
  return ABILITY_DIM_LABEL[q]
}

/** Short value prefix for generated build rows (e.g. DMG, Daze, ATK). */
export function optTargetShortValueLabel(
  target: TargetTag | undefined
): string {
  if (!target) return ''
  const q = target.q
  if (q && isAbilityDim(q)) return ABILITY_DIM_LABEL[q]
  if (q) return q.endsWith('_') ? q.slice(0, -1).toUpperCase() : q.toUpperCase()
  return target.name ?? ''
}
