import {
  zodBoolean,
  zodBoundedNumber,
  zodEnum,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import type { AscensionKey, RefinementKey } from '@genshin-optimizer/gi/consts'
import {
  allLocationCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

export const weaponSchema = z.object({
  key: zodEnum(allWeaponKeys),
  level: zodBoundedNumber(1, 90, 1),
  ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
  refinement: zodBoundedNumber(1, 5, 1) as z.ZodType<RefinementKey>,
  location: zodEnumWithDefault([...allLocationCharacterKeys, ''] as const, ''),
  lock: zodBoolean({ coerce: true }),
})

export type IWeapon = z.infer<typeof weaponSchema>

export function parseWeapon(obj: unknown): IWeapon | undefined {
  const result = weaponSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
