import { zodNumericLiteral } from '@genshin-optimizer/common/database'
import type {
  AscensionKey,
  LocationCharacterKey,
  LocationKey,
  RefinementKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  allAscensionKeys,
  allLocationCharacterKeys,
  allRefinementKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

export const weaponKeySchema = z
  .string()
  .refine((val): val is WeaponKey => allWeaponKeys.includes(val as WeaponKey))

export const ascensionKeySchema = zodNumericLiteral(allAscensionKeys)
export const refinementKeySchema = zodNumericLiteral(allRefinementKeys)

export const locationCharacterKeySchema = z
  .string()
  .refine(
    (val): val is LocationKey =>
      val === '' ||
      allLocationCharacterKeys.includes(val as LocationCharacterKey)
  )

export const weaponSchema = z.object({
  key: weaponKeySchema,
  level: z.number().int().min(1).max(90),
  ascension: ascensionKeySchema,
  refinement: refinementKeySchema,
  location: locationCharacterKeySchema,
  lock: z.boolean(),
})

export const weaponRecoverySchema = z.object({
  key: weaponKeySchema,
  level: z.preprocess((val) => (typeof val === 'number' ? val : 1), z.number()),
  ascension: z.preprocess(
    (val): AscensionKey =>
      typeof val === 'number' && val >= 0 && val <= 6
        ? (val as AscensionKey)
        : 0,
    z.number() as z.ZodType<AscensionKey>
  ),
  refinement: z.preprocess(
    (val): RefinementKey =>
      typeof val === 'number' && val >= 1 && val <= 5
        ? (val as RefinementKey)
        : 1,
    z.number() as z.ZodType<RefinementKey>
  ),
  location: z.preprocess(
    (val): LocationKey =>
      val && allLocationCharacterKeys.includes(val as LocationCharacterKey)
        ? (val as LocationKey)
        : '',
    z.string() as z.ZodType<LocationKey>
  ),
  lock: z.preprocess((val) => !!val, z.boolean()),
})

export interface IWeapon {
  key: WeaponKey
  level: number
  ascension: AscensionKey
  refinement: RefinementKey
  location: LocationKey
  lock: boolean
}

export type WeaponRecoveryData = z.infer<typeof weaponRecoverySchema>

export interface WeaponStatsLookup {
  getWeaponData(key: WeaponKey): {
    rarity: 1 | 2 | 3 | 4 | 5
    weaponType: string
  }
  getCharWeaponType(location: LocationCharacterKey): string
  getMaxLevel(rarity: 1 | 2 | 3 | 4 | 5): number
  validateLevelAsc(
    level: number,
    ascension: AscensionKey
  ): { level: number; ascension: AscensionKey }
}

export function parseWeaponRecovery(
  obj: unknown
): WeaponRecoveryData | undefined {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const result = weaponRecoverySchema.safeParse(obj)
  return result.success ? result.data : undefined
}

export function validateWeapon(
  obj: unknown,
  stats: WeaponStatsLookup
): IWeapon | undefined {
  const result = weaponRecoverySchema.safeParse(obj)
  if (!result.success) return undefined

  const data = result.data
  const key = data.key as WeaponKey

  const weaponData = stats.getWeaponData(key)
  if (!weaponData) return undefined

  const { rarity, weaponType } = weaponData

  if (data.level > stats.getMaxLevel(rarity)) return undefined

  const { level, ascension } = stats.validateLevelAsc(
    data.level,
    data.ascension
  )

  const location = data.location
  if (location) {
    const charWeaponType = stats.getCharWeaponType(
      location as LocationCharacterKey
    )
    if (charWeaponType !== weaponType) {
      return undefined
    }
  }

  return {
    key,
    level,
    ascension,
    refinement: data.refinement,
    location,
    lock: data.lock,
  }
}

export function parseWeaponImport(obj: unknown) {
  return weaponSchema.parse(obj)
}

export function safeParseWeaponImport(obj: unknown) {
  return weaponSchema.safeParse(obj)
}
