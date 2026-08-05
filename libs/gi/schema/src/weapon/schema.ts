import {
  zodBoolean,
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import {
  type AscensionKey,
  allLocationCharacterKeys,
  allWeaponKeys,
  type RefinementKey,
  validateWeaponLevelAsc,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { z } from 'zod'

const weaponBaseSchema = z
  .object({
    key: zodEnum(allWeaponKeys),
    level: zodClampedNumber(1, 90, 1),
    ascension: zodClampedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
    refinement: zodBoundedNumber(1, 5, 1) as z.ZodType<RefinementKey>,
    location: zodEnumWithDefault(
      [...allLocationCharacterKeys, ''] as const,
      ''
    ),
    lock: zodBoolean(),
  })
  .passthrough()

export const weaponSchema = weaponBaseSchema
  .refine((data) => !!allStats.weapon.data[data.key], {
    message: 'Invalid weapon key',
  })
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
    const rarity = allStats.weapon.data[data.key]?.rarity
    if (!rarity) throw new Error('Invalid weapon key')
    const { level, ascension } = validateWeaponLevelAsc(
      data.level,
      data.ascension,
      rarity
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
