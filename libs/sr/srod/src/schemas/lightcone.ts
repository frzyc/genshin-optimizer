import {
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
  zodNumericLiteral,
} from '@genshin-optimizer/common/database'
import type { AscensionKey, LocationKey } from '@genshin-optimizer/sr/consts'
import {
  allAscensionKeys,
  allLightConeKeys,
  allLocationKeys,
  allSuperimposeKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import type { ILightCone } from '../ILightCone'

// Light cone level - bounded number
const lightConeLevel = zodBoundedNumber(1, lightConeMaxLevel, 1)

// Strict key validation - returns undefined for invalid keys
const lightConeKey = zodEnum(allLightConeKeys)

// Location validation - '' for unequipped, or a valid character key
const locationKey = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return ''
  if (typeof val !== 'string') return ''
  return allLocationKeys.includes(val as LocationKey) ? val : ''
}, z.string()) as z.ZodType<LocationKey>

// Superimpose validation - clamp to valid range [1, 5]
const superimposeKey = z.preprocess((val) => {
  if (typeof val !== 'number') return 1
  return zodClampedNumber(1, 5, 1).parse(val)
}, zodNumericLiteral(allSuperimposeKeys))

// Ascension key validation - number in range
const ascensionKey = z.preprocess((val) => {
  if (typeof val !== 'number') return 0
  if (!allAscensionKeys.includes(val as AscensionKey)) return 0
  return val
}, z.number()) as z.ZodType<AscensionKey>

/**
 * Schema for validating light cone data during import/recovery.
 * Returns undefined for invalid essential fields (key), recovers others.
 */
export const lightConeSchema = z.object({
  key: lightConeKey,
  level: lightConeLevel,
  ascension: ascensionKey,
  superimpose: superimposeKey,
  location: locationKey,
  lock: z.preprocess((val) => !!val, z.boolean()),
}) as z.ZodType<ILightCone>

/**
 * Validates light cone data and applies level/ascension co-validation.
 * @param obj - Raw light cone data to validate
 * @param validateLevelAsc - Function to co-validate level and ascension
 * @returns Validated ILightCone or undefined if invalid
 */
export function validateLightConeWithRules(
  obj: unknown,
  validateLevelAsc: (
    level: number,
    ascension: AscensionKey
  ) => { level: number; ascension: AscensionKey }
): ILightCone | undefined {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const { key, level: rawLevel, ascension: rawAscension } = obj as ILightCone

  // Key is non-recoverable
  if (!allLightConeKeys.includes(key)) return undefined

  // Max level check
  if (typeof rawLevel === 'number' && rawLevel > lightConeMaxLevel)
    return undefined

  // Apply level/ascension co-validation
  const { level, ascension } = validateLevelAsc(
    typeof rawLevel === 'number' ? rawLevel : 1,
    typeof rawAscension === 'number' && allAscensionKeys.includes(rawAscension as AscensionKey)
      ? (rawAscension as AscensionKey)
      : 0
  )

  // Now parse with defaults for other fields
  const result = lightConeSchema.safeParse({ ...obj, level, ascension })
  return result.success ? result.data : undefined
}
