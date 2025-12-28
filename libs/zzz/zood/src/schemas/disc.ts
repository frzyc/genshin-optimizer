import { notEmpty } from '@genshin-optimizer/common/util'
import type {
  DiscMainStatKey,
  DiscRarityKey,
  DiscSetKey,
  DiscSlotKey,
  DiscSubStatKey,
  LocationKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allCharacterKeys,
  allDiscMainStatKeys,
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
  discSubstatRollData,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'

/**
 * Disc schema - single source of truth for:
 * - TypeScript types (IDisc, ISubstat)
 * - Validation
 * - Import/export parsing
 *
 * Note: Disc validation has complex interdependencies:
 * - mainStatKey validity depends on slotKey
 * - level max depends on rarity
 * - substats cannot match mainStatKey
 *
 * The schema handles basic structure, while validateDisc() handles
 * the interdependent business rules.
 */

// TypeScript interfaces
export interface ISubstat {
  key: DiscSubStatKey
  upgrades: number
}

export interface IDisc {
  setKey: DiscSetKey
  slotKey: DiscSlotKey
  level: number
  rarity: DiscRarityKey
  mainStatKey: DiscMainStatKey
  location: LocationKey
  lock: boolean
  trash: boolean
  substats: ISubstat[]
}

// Substat schema
export const substatSchema = z.object({
  key: z
    .string()
    .refine((val): val is DiscSubStatKey =>
      allDiscSubStatKeys.includes(val as DiscSubStatKey)
    ),
  upgrades: z.number().int().min(0),
})

// STRICT schema - for imports (rejects invalid data)
export const discSchema = z.object({
  setKey: z
    .string()
    .refine((val): val is DiscSetKey =>
      allDiscSetKeys.includes(val as DiscSetKey)
    ),
  slotKey: z
    .string()
    .refine((val): val is DiscSlotKey =>
      allDiscSlotKeys.includes(val as DiscSlotKey)
    ),
  level: z.number().int().min(0).max(15),
  rarity: z
    .string()
    .refine((val): val is DiscRarityKey =>
      allDiscRarityKeys.includes(val as DiscRarityKey)
    ),
  mainStatKey: z
    .string()
    .refine((val): val is DiscMainStatKey =>
      allDiscMainStatKeys.includes(val as DiscMainStatKey)
    ),
  location: z.string(),
  lock: z.boolean(),
  trash: z.boolean(),
  substats: z.array(substatSchema),
})

// LENIENT schema - for database recovery (provides defaults)
export const discRecoverySchema = z.object({
  setKey: z.preprocess(
    (val): DiscSetKey =>
      allDiscSetKeys.includes(val as DiscSetKey)
        ? (val as DiscSetKey)
        : allDiscSetKeys[0],
    z.string() as z.ZodType<DiscSetKey>
  ),
  slotKey: z.preprocess(
    (val): DiscSlotKey =>
      allDiscSlotKeys.includes(val as DiscSlotKey) ? (val as DiscSlotKey) : '1',
    z.string() as z.ZodType<DiscSlotKey>
  ),
  level: z.preprocess(
    (val) => (typeof val === 'number' ? Math.round(val) : 0),
    z.number()
  ),
  rarity: z.preprocess(
    (val): DiscRarityKey =>
      allDiscRarityKeys.includes(val as DiscRarityKey)
        ? (val as DiscRarityKey)
        : 'S',
    z.string() as z.ZodType<DiscRarityKey>
  ),
  mainStatKey: z.unknown(), // Validated based on slotKey in post-processing
  substats: z.unknown(), // Parsed separately in post-processing
  location: z.preprocess(
    (val): LocationKey =>
      val && allCharacterKeys.includes(val as (typeof allCharacterKeys)[number])
        ? (val as LocationKey)
        : '',
    z.string() as z.ZodType<LocationKey>
  ),
  lock: z.preprocess((val) => !!val, z.boolean()),
  trash: z.preprocess((val) => !!val, z.boolean()),
})

/**
 * Parse substats array with validation
 */
export function parseSubstats(
  obj: unknown,
  _rarity: DiscRarityKey,
  _allowZeroSub = false,
  _sortSubs = true
): ISubstat[] {
  if (!Array.isArray(obj)) return []
  const substats = (obj as ISubstat[])
    .map(({ key, upgrades = 0 }) => {
      if (!key) return null
      if (
        !allDiscSubStatKeys.includes(key as DiscSubStatKey) ||
        typeof upgrades !== 'number' ||
        !Number.isFinite(upgrades)
      )
        return null

      upgrades = Math.round(upgrades)

      return { key, upgrades }
    })
    .filter(notEmpty) as ISubstat[]

  return substats
}

/**
 * Apply business rules after schema validation.
 * Handles interdependent validations (mainStat/slot, level/rarity, substats).
 */
export function applyDiscRules(
  data: z.infer<typeof discRecoverySchema>,
  allowZeroSub = false,
  sortSubs = true
): IDisc | undefined {
  const slotKey = data.slotKey
  const rarity = data.rarity

  // Validate level based on rarity
  let level = data.level
  if (level < 0 || level > discMaxLevel[rarity]) level = 0

  // Validate mainStatKey based on slotKey - always provide valid fallback
  const plausibleMainStats = discSlotToMainStatKeys[slotKey]
  let mainStatKey = data.mainStatKey as DiscMainStatKey
  if (!plausibleMainStats.includes(mainStatKey)) {
    mainStatKey = plausibleMainStats[0]
  }

  // Parse substats
  const substats = parseSubstats(data.substats, rarity, allowZeroSub, sortSubs)

  // Substat cannot have same key as mainstat
  if (substats.find((sub) => sub.key === mainStatKey)) return undefined

  return {
    setKey: data.setKey,
    rarity,
    level,
    slotKey,
    mainStatKey,
    substats,
    location: data.location,
    lock: data.lock,
    trash: data.trash,
  }
}

/**
 * Validate disc data (lenient - for database recovery)
 */
export function validateDisc(
  obj: unknown,
  allowZeroSub = false,
  sortSubs = true
): IDisc | undefined {
  if (!obj || typeof obj !== 'object' || obj === null || Array.isArray(obj))
    return undefined

  const result = discRecoverySchema.safeParse(obj)
  if (!result.success) return undefined

  return applyDiscRules(result.data, allowZeroSub, sortSubs)
}

/**
 * Parse disc import data (strict - throws on invalid)
 */
export function parseDiscImport(obj: unknown): IDisc {
  const data = discSchema.parse(obj)

  // Apply business rules (mainStat/slot validation)
  const slotKey = data.slotKey as DiscSlotKey
  const mainStatKey = data.mainStatKey as DiscMainStatKey
  const plausibleMainStats = discSlotToMainStatKeys[slotKey]
  if (!plausibleMainStats.includes(mainStatKey)) {
    throw new Error(`Invalid mainStatKey ${mainStatKey} for slotKey ${slotKey}`)
  }

  // Check substats don't match mainstat
  if (data.substats.find((sub) => sub.key === data.mainStatKey)) {
    throw new Error(`Substat cannot have same key as mainstat`)
  }

  return data as IDisc
}

/**
 * Safe parse disc import data (strict - returns result object)
 */
export function safeParseDiscImport(obj: unknown) {
  try {
    const data = parseDiscImport(obj)
    return { success: true as const, data }
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validate disc with additional rarity-based checks.
 * Returns validation errors for user feedback.
 */
export function validateDiscWithErrors(disc: Partial<IDisc>) {
  const errors: string[] = []
  const { mainStatKey } = disc
  let { rarity, level, substats } = disc
  const validatedDisc = validateDisc(disc)

  rarity = rarity ? rarity : allDiscRarityKeys[0]
  level = level ? level : 0
  substats = substats ? substats : []
  const minSubstats = rarity === allDiscRarityKeys[0] ? 3 : 2

  // Substat cannot have same key as mainstat
  if (mainStatKey) {
    const dupSubIndex = substats.findIndex((sub) => sub.key === mainStatKey)
    if (dupSubIndex > -1)
      errors.push(
        `Substat at row ${dupSubIndex + 1} with ${
          statKeyTextMap[mainStatKey]
        } is the same as mainstat.`
      )
  }

  if (substats && substats.length >= minSubstats) {
    const totalUpgrades = substats.reduce((sum, item) => sum + item.upgrades, 0)
    const { low, high } = discSubstatRollData[rarity]
    const lowerBound = low + Math.floor(level / 3)
    const upperBound = high + Math.floor(level / 3)

    if (totalUpgrades > upperBound)
      errors.push(
        `${rarity}-star artifact (level ${level}) should have no more than ${upperBound} upgrades. It currently has ${totalUpgrades} upgrades.`
      )
    else if (totalUpgrades < lowerBound)
      errors.push(
        `${rarity}-star artifact (level ${level}) should have at least ${lowerBound} upgrades. It currently has ${totalUpgrades} upgrades.`
      )
  } else {
    errors.push(
      `${rarity}-rank disc (level ${level}) should have at least ${minSubstats} substats. It currently has ${substats?.length} substats.`
    )
  }

  if (substats.length < 4) {
    const substat = substats.find((substat) => (substat.upgrades ?? 0) > 1)
    if (substat)
      errors.push(
        `Substat ${
          statKeyTextMap[substat.key as keyof typeof statKeyTextMap] ??
          substat.key
        } has > 1 upgrade, but not all substats are unlocked.`
      )
  }

  return { validatedDisc, errors }
}
