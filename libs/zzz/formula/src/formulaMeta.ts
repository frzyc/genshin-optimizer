export const formulaDimensions = ['dmg', 'daze', 'anomBuildup'] as const
export type FormulaDimension = (typeof formulaDimensions)[number]

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
} as const

const legacyNameSuffix = /_(dmg|daze|anomBuildup)$/

/** Meta map key for a formula listing (bundled vs legacy suffixed names). */
export function formulaMetaKey(abilityName: string, q: string): string {
  if (legacyNameSuffix.test(abilityName)) return abilityName
  if (q in formulaDimensionByQ) return `${abilityName}:${q}`
  return abilityName
}

export function parseLegacyFormulaName(name: string):
  | { baseName: string; formulaDimension: FormulaDimension }
  | undefined {
  const match = name.match(/^(.*)_(dmg|daze|anomBuildup)$/)
  if (!match) return undefined
  const [, baseName, suffix] = match
  const formulaDimension =
    suffix === 'dmg'
      ? 'dmg'
      : suffix === 'daze'
        ? 'daze'
        : 'anomBuildup'
  return { baseName, formulaDimension }
}
