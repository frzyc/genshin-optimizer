import {
  zodBoundedNumber,
  zodClampedNumber,
  zodEnum,
} from '@genshin-optimizer/common/database'
import type { AscensionKey } from '@genshin-optimizer/gi/consts'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import { z } from 'zod'

const talentSchema = z.object({
  auto: zodClampedNumber(1, 15, 1),
  skill: zodClampedNumber(1, 15, 1),
  burst: zodClampedNumber(1, 15, 1),
})

export const characterSchema = z.object({
  key: zodEnum(allCharacterKeys),
  level: zodBoundedNumber(1, 90, 1),
  constellation: zodClampedNumber(0, 6, 0),
  ascension: zodBoundedNumber(0, 6, 0) as z.ZodType<AscensionKey>,
  talent: z.preprocess((val) => {
    if (!val || typeof val !== 'object') {
      return { auto: 1, skill: 1, burst: 1 }
    }
    return val
  }, talentSchema),
})

export type ICharacter = z.infer<typeof characterSchema>
export type ICharacterTalent = ICharacter['talent']

export function isTalentKey(tKey: string): tKey is keyof ICharacterTalent {
  return (['auto', 'skill', 'burst'] as const).includes(
    tKey as keyof ICharacterTalent
  )
}

export function parseCharacter(obj: unknown): ICharacter | undefined {
  const result = characterSchema.safeParse(obj)
  return result.success ? result.data : undefined
}
