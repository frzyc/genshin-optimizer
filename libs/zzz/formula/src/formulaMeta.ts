import type { Tag } from './data/util'

export const abilityDims = [
  'standardDmg',
  'sheerDmg',
  'dazeBuildup',
  'anomBuildup',
] as const
export type AbilityDim = (typeof abilityDims)[number]

export const dmgAbilityDims = ['standardDmg', 'sheerDmg'] as const
export type DmgAbilityDim = (typeof dmgAbilityDims)[number]

export function isAbilityDim(q: string | null | undefined): q is AbilityDim {
  return !!q && (abilityDims as readonly string[]).includes(q)
}

export function isDmgAbilityDim(
  q: string | null | undefined
): q is DmgAbilityDim {
  return q === 'standardDmg' || q === 'sheerDmg'
}

/** Base ability hit name without `:standardDmg` meta suffix. */
export function abilityBaseName(name: string | null | undefined): string {
  if (!name) return ''
  return name.split(':')[0]
}

/** Meta map key for a formula listing (`Ability_0:standardDmg` when ambiguous). */
export function formulaMetaKey(
  abilityName: string,
  q: string,
  ambiguous = false
): string {
  if (ambiguous && isAbilityDim(q)) return `${abilityName}:${q}`
  return abilityName
}

/** Unique key while extracting formulas before per-sheet disambiguation. */
export function provisionalFormulaMetaKey(
  abilityName: string,
  q: string
): string {
  return `${abilityName}\0${q}`
}

/** Assign bare or colon keys from ability-dim sibling counts per `tag.name`. */
export function normalizeSheetFormulaKeys<
  T extends { name: string; tag?: Tag },
>(sheetFormulas: Record<string, T>): Record<string, T> {
  const abilityDimCount = new Map<string, number>()
  for (const entry of Object.values(sheetFormulas)) {
    const name = entry.tag?.name
    const q = entry.tag?.q
    if (name && isAbilityDim(q)) {
      abilityDimCount.set(name, (abilityDimCount.get(name) ?? 0) + 1)
    }
  }

  const out: Record<string, T> = {}
  for (const entry of Object.values(sheetFormulas)) {
    const name = entry.tag?.name ?? entry.name
    const q = entry.tag?.q ?? ''
    const ambiguous = (abilityDimCount.get(name) ?? 0) > 1
    const key = formulaMetaKey(name, q, ambiguous)
    out[key] = { ...entry, name: key }
  }
  return out
}

/** Resolve a bundled ability listing by persisted `tag.name` + ability dim. */
export function bundledFormulaInSheet<T extends { tag?: Tag }>(
  sheetFormulas: Record<string, T> | undefined,
  hitName: string,
  q: AbilityDim
): T | undefined {
  if (!sheetFormulas) return undefined
  const colonKey = `${hitName}:${q}`
  if (sheetFormulas[colonKey]) return sheetFormulas[colonKey]
  const bare = sheetFormulas[hitName]
  if (bare?.tag?.q === q) return bare
  return undefined
}
