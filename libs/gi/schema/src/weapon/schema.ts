import {
  zodBoolean,
  zodBoundedNumber,
  zodEnum,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import {
  type AscensionKey,
  type RefinementKey,
  type WeaponKey,
  allLocationCharacterKeys,
  allWeaponKeys,
  validateWeaponLevelAsc,
  weaponMaxLevel,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { z } from 'zod'

const weaponBaseSchema = z
  .object({
    key: zodEnum(allWeaponKeys),
    level: zodBoundedNumber(1, 90, 1),
    ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
    refinement: zodBoundedNumber(1, 5, 1) as z.ZodType<RefinementKey>,
    location: zodEnumWithDefault(
      [...allLocationCharacterKeys, ''] as const,
      ''
    ),
    lock: zodBoolean(),
  })
  .passthrough()

export const weaponSchema = z
  .preprocess(
    (obj) => ({
      ...(typeof obj === 'object' && obj !== null ? obj : {}),
      _rawLevel: (obj as { level?: unknown })?.level,
    }),
    weaponBaseSchema
  )
  .refine((data) => !!allStats.weapon.data[data.key], {
    message: 'Invalid weapon key',
  })
  .refine(
    (data) => {
      const weaponData = allStats.weapon.data[data.key]
      if (!weaponData) return false
      const rawLevel = (data as { _rawLevel?: unknown })._rawLevel
      if (typeof rawLevel !== 'number') return true
      return rawLevel <= weaponMaxLevel[weaponData.rarity]
    },
    { message: 'Level exceeds max for weapon rarity' }
  )
  .refine(
    (data) => {
      if (!data.location) return true
      const weaponData = allStats.weapon.data[data.key]
      if (!weaponData) return false
      const charData = allStats.char.data[data.location]
      if (!charData) return true
      return charData.weaponType === weaponData.weaponType
    },
    { message: 'Weapon type does not match character' }
  )
  .transform((data) => {
    const { level, ascension } = validateWeaponLevelAsc(
      data.level,
      data.ascension
    )

    return {
      key: data.key as WeaponKey,
      level,
      ascension,
      refinement: data.refinement,
      location: data.location,
      lock: data.lock,
    }
  })

export type IWeapon = z.infer<typeof weaponSchema>

export function parseWeapon(obj: unknown): IWeapon | undefined {
  const result = weaponSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
