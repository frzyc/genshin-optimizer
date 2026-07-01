export const formulaDimensions = ['dmg', 'daze', 'anomBuildup'] as const
export type FormulaDimension = (typeof formulaDimensions)[number]

export const formulaQs = [
  'standardDmg',
  'sheerDmg',
  'dazeBuildup',
  'anomBuildup',
] as const
export type FormulaQ = (typeof formulaQs)[number]

export const dmgFormulaQs = ['standardDmg', 'sheerDmg'] as const

export const qByFormulaDimension = {
  dmg: 'standardDmg',
  daze: 'dazeBuildup',
  anomBuildup: 'anomBuildup',
} as const satisfies Record<FormulaDimension, string>

export const formulaDimensionByQ = {
  standardDmg: 'dmg',
  sheerDmg: 'dmg',
  dazeBuildup: 'daze',
  anomBuildup: 'anomBuildup',
} as const satisfies Record<FormulaQ, FormulaDimension>

export function formulaQsForDimension(
  dim: FormulaDimension
): readonly FormulaQ[] {
  if (dim === 'dmg') return dmgFormulaQs
  return [qByFormulaDimension[dim]]
}

/** Pick the formula leg `q` for a dimension on an ability (e.g. standard vs sheer DMG). */
export function resolveFormulaQ(
  sheetFormulas: Record<string, unknown> | undefined,
  baseName: string,
  dim: FormulaDimension
): FormulaQ | undefined {
  if (!sheetFormulas) return undefined
  for (const q of formulaQsForDimension(dim)) {
    if (sheetFormulas[formulaMetaKey(baseName, q)]) return q
  }
  return undefined
}

/** Meta map key for a formula listing (`Ability_0:standardDmg`). */
export function formulaMetaKey(abilityName: string, q: string): string {
  if (q in formulaDimensionByQ) return `${abilityName}:${q}`
  return abilityName
}

export function parseLegacyFormulaName(
  name: string
): { baseName: string; formulaDimension: FormulaDimension } | undefined {
  const match = name.match(/^(.*)_(dmg|daze|anomBuildup)$/)
  if (!match) return undefined
  const [, baseName, suffix] = match
  const formulaDimension =
    suffix === 'dmg' ? 'dmg' : suffix === 'daze' ? 'daze' : 'anomBuildup'
  return { baseName, formulaDimension }
}
